// (C) 2019 GoodData Corporation
import React from "react";
import kebabCase from "lodash/kebabCase";
import cx from "classnames";
import { ListItem } from "../ListItem/ListItem";
import { ListHeading } from "../ListHeading/ListHeading";
import { RelativePresetTitleTranslated } from "../RelativePresetTitleTranslated/RelativePresetTitleTranslated";
import { DateFilterTextLocalized } from "../DateFilterTextLocalized/DateFilterTextLocalized";
import { DateFilterRelativeOptionGroup, DateFilterOption } from "../interfaces";
import { IRelativeDateFilterPreset, DateFilterGranularity } from "@gooddata/sdk-backend-spi";

const granularityOrder: DateFilterGranularity[] = [
    "GDC.time.date",
    "GDC.time.week_us",
    "GDC.time.month",
    "GDC.time.quarter",
    "GDC.time.year",
];

export const RelativePresetFilterItems: React.FC<{
    dateFormat: string;
    filterOption: DateFilterRelativeOptionGroup;
    selectedFilterOption: DateFilterOption;
    className?: string;
    onSelectedFilterOptionChange: (option: DateFilterOption) => void;
    availableGranularities: DateFilterGranularity[];
}> = ({
    dateFormat,
    filterOption,
    selectedFilterOption,
    onSelectedFilterOptionChange,
    className,
    availableGranularities,
}) => {
    const relativePresets = granularityOrder
        .filter((granularity) => {
            return Boolean(
                filterOption &&
                    filterOption[granularity] &&
                    filterOption[granularity].length > 0 &&
                    availableGranularities.indexOf(granularity) > -1,
            );
        })
        .map((granularity) => ({
            granularity,
            items: filterOption[granularity] as IRelativeDateFilterPreset[],
        }));

    return (
        <>
            {relativePresets.map((preset) => (
                <React.Fragment key={preset.granularity}>
                    <ListHeading className={className}>
                        <RelativePresetTitleTranslated granularity={preset.granularity} />
                    </ListHeading>
                    {preset.items.map((item) => (
                        <ListItem
                            key={item.localIdentifier}
                            isSelected={item.localIdentifier === selectedFilterOption.localIdentifier}
                            onClick={() => onSelectedFilterOptionChange(item)}
                            className={cx(`s-relative-preset-${kebabCase(item.localIdentifier)}`, className)}
                        >
                            <DateFilterTextLocalized filter={item} dateFormat={dateFormat} />
                        </ListItem>
                    ))}
                </React.Fragment>
            ))}
        </>
    );
};
