// (C) 2019-2020 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";
import { IMeasureExpressionToken } from "../fromModel/ldm/measure";
import { IMeasureMetadataObject } from "../fromModel/ldm/metadata";
import { IMeasureMetadataObjectDefinition } from "../fromModel/ldm/metadata";

/**
 * Service for querying additional measures data.
 * If you want to query measures themselves, use catalog {@link IWorkspaceCatalogFactory}
 *
 * @public
 */
export interface IWorkspaceMeasuresService {
    /**
     * Get measure expression tokens for provided measure identifier
     * @param ref - ref of the measure
     * @returns promise of measure expression tokens
     */
    getMeasureExpressionTokens(ref: ObjRef): Promise<IMeasureExpressionToken[]>;

    createMeasure(measure: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject>;

    updateMeasure(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject>;

    deleteMeasure(measureRef: ObjRef): Promise<void>;
}
