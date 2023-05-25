// (C) 2022 GoodData Corporation
import {
    DateAttributeGranularity,
    IDimensionDescriptor,
    IDimensionItemDescriptor,
    IMeasureDescriptor,
    IResultAttributeHeader,
    IResultHeader,
    IResultMeasureHeader,
    IResultTotalHeader,
    isAttributeDescriptor,
    isMeasureGroupDescriptor,
} from "@gooddata/sdk-model";
import { DateFormatter, DateParseFormatter } from "../dateFormatting/types";
import {
    AttributeExecutionResultHeader,
    DimensionHeader,
    isResultAttributeHeader,
    isResultMeasureHeader,
    isResultTotalHeader,
    JsonApiAttributeOutAttributesGranularityEnum,
    MeasureExecutionResultHeader,
    TotalExecutionResultHeader,
} from "@gooddata/api-client-tiger";
import { createDateValueFormatter } from "../dateFormatting/dateValueFormatter";
import { toSdkGranularity } from "../dateGranularityConversions";
import { FormattingLocale } from "../dateFormatting/defaultDateFormatter";

type DateAttributeFormatProps = {
    granularity: DateAttributeGranularity;
    format: {
        locale: FormattingLocale;
        pattern: string;
    };
};

const supportedSuffixes: string[] = Object.keys(JsonApiAttributeOutAttributesGranularityEnum)
    .filter((item) => isNaN(Number(item)))
    .map(
        (key) =>
            JsonApiAttributeOutAttributesGranularityEnum[
                key as keyof typeof JsonApiAttributeOutAttributesGranularityEnum
            ],
    );

function getDateFormatProps(header: IDimensionItemDescriptor): DateAttributeFormatProps | undefined {
    if (
        !isAttributeDescriptor(header) ||
        !header.attributeHeader.granularity ||
        !supportedSuffixes.includes(header.attributeHeader.granularity) ||
        !header.attributeHeader.format
    ) {
        return undefined;
    }

    const {
        attributeHeader: { granularity, format },
    } = header;

    return {
        granularity: toSdkGranularity(granularity as JsonApiAttributeOutAttributesGranularityEnum),
        format: {
            locale: format.locale as FormattingLocale,
            pattern: format.pattern,
        },
    };
}

function getMeasuresFromDimensions(dimensions: IDimensionDescriptor[]): IMeasureDescriptor[] {
    for (const dim of dimensions) {
        const measureGroup = dim.headers.find(isMeasureGroupDescriptor);

        if (measureGroup) {
            return measureGroup.measureGroupHeader.items;
        }
    }

    return [];
}

export function getTransformDimensionHeaders(
    dimensions: IDimensionDescriptor[],
    dateFormatter: DateFormatter,
): (dimensionHeaders: DimensionHeader[]) => IResultHeader[][][] {
    const measureDescriptors = getMeasuresFromDimensions(dimensions);
    const dateValueFormatter = createDateValueFormatter(dateFormatter);

    return (dimensionHeaders: DimensionHeader[]) =>
        dimensionHeaders.map((dimensionHeader, dimensionIndex) => {
            const totalIndices: { [key: number]: TotalExecutionResultHeader } = {};
            return dimensionHeader.headerGroups.map((headerGroup, headerGroupIndex) => {
                const dateFormatProps = getDateFormatProps(
                    dimensions[dimensionIndex].headers[headerGroupIndex],
                );
                return headerGroup.headers.map((header): IResultHeader => {
                    if (isResultAttributeHeader(header)) {
                        return attributeMeasureItem(header, dateFormatProps, dateValueFormatter);
                    }

                    if (isResultMeasureHeader(header)) {
                        if (totalIndices[headerGroupIndex]) {
                            const index = header?.measureHeader?.measureIndex;
                            return totalHeaderItem(totalIndices[headerGroupIndex], index);
                        }

                        return measureHeaderItem(header, measureDescriptors);
                    }

                    if (isResultTotalHeader(header)) {
                        totalIndices[headerGroupIndex] = header;
                        return totalHeaderItem(header);
                    }

                    // This code should never be reachable
                    throw new Error(`Unexpected type of ResultHeader: ${header}`);
                });
            });
        });
}

function attributeMeasureItem(
    header: AttributeExecutionResultHeader,
    dateFormatProps: DateAttributeFormatProps | undefined,
    dateValueFormatter: DateParseFormatter,
): IResultAttributeHeader {
    const formattedNameObj = dateFormatProps
        ? {
              formattedName: dateValueFormatter(
                  header.attributeHeader.labelValue,
                  dateFormatProps.granularity,
                  dateFormatProps.format.locale,
                  dateFormatProps.format.pattern,
              ),
          }
        : {};

    return {
        attributeHeaderItem: {
            uri: header.attributeHeader.primaryLabelValue,
            name: header.attributeHeader.labelValue,
            ...formattedNameObj,
        },
    };
}

function measureHeaderItem(
    header: MeasureExecutionResultHeader,
    measureDescriptors: IMeasureDescriptor[],
): IResultMeasureHeader {
    /*
     * Funny stuff #1 - Tiger sends just the measure index in the measure headers. This is the index of the
     * measure descriptor within the measure group. The code looks up the measure descriptor so that
     * it can then fill in the `name` to the one in the descriptor
     */
    const measureIndex = header.measureHeader.measureIndex;

    return {
        measureHeaderItem: {
            name: measureDescriptors[measureIndex]?.measureHeaderItem.name,
            order: measureIndex,
        },
    };
}

function totalHeaderItem(header: TotalExecutionResultHeader, measureIndex?: number): IResultTotalHeader {
    const optionalMeasureIndex = measureIndex !== undefined ? { measureIndex } : {};
    return {
        totalHeaderItem: {
            type: header.totalHeader.function,
            name: header.totalHeader.function.toLowerCase(),
            ...optionalMeasureIndex,
        },
    };
}
