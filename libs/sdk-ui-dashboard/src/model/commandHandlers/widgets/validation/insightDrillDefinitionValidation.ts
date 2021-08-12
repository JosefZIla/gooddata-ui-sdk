// (C) 2021 GoodData Corporation

import { IListedDashboard, InsightDrillDefinition } from "@gooddata/sdk-backend-spi";
import { SagaIterator } from "redux-saga";
import { call, SagaReturnType, select } from "redux-saga/effects";
import { invalidArgumentsProvided } from "../../../events/general";
import { DashboardContext } from "../../../types/commonTypes";
import {
    extractDisplayFormIdentifiers,
    extractInsightRefs,
    InsightDrillDefinitionValidationData,
    validateDrillDefinitionOrigin,
    validateInsightDrillDefinition,
} from "./insightDrillDefinitionUtils";
import { IDrillTargets } from "../../../../model/state/drillTargets/drillTargetsTypes";
import { ObjRefMap } from "../../../../_staging/metadata/objRefMap";
import { ObjRef } from "@gooddata/sdk-model";
import { IDashboardCommand } from "../../../commands";
import { InsightResolutionResult, resolveInsights } from "../../../utils/insightResolver";
import {
    DisplayFormResolutionResult,
    resolveDisplayFormMetadata,
} from "../../../../model/utils/displayFormResolver";
import { selectDrillTargetsByWidgetRef } from "../../../../model/state/drillTargets/drillTargetsSelectors";
import { selectListedDashboardsMap } from "../../../state/listedDashboards/listedDashboardsSelectors";

export function validateDrillDefinition(
    drillDefinition: InsightDrillDefinition,
    validationData: DrillDefinitionValidationData,
    ctx: DashboardContext,
    cmd: IDashboardCommand,
): InsightDrillDefinition {
    let item = drillDefinition;
    // validate drill targets
    if (!validationData.drillTargets?.availableDrillTargets) {
        throw invalidArgumentsProvided(ctx, cmd, `Drill targets not set`);
    }

    // validate drills origin
    try {
        item = validateDrillDefinitionOrigin(item, validationData.drillTargets.availableDrillTargets);
    } catch (ex) {
        const messageDetail = (ex as Error).message;

        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid drill origin for InsightDrillDefinition. Error: ${messageDetail}`,
        );
    }

    // validate drill
    const validationContext: InsightDrillDefinitionValidationData = {
        dashboardsMap: validationData.listedDashboardMap,
        insightsMap: validationData.resolvedInsights.resolved,
        displayFormsMap: validationData.resolvedDisplayForms.resolved,
    };

    try {
        item = validateInsightDrillDefinition(item, validationContext);
    } catch (ex) {
        const messageDetail = (ex as Error).message;

        throw invalidArgumentsProvided(ctx, cmd, `Invalid InsightDrillDefinition. Error: ${messageDetail}`);
    }

    return item;
}

export interface DrillDefinitionValidationData {
    drillTargets: IDrillTargets | undefined;
    resolvedInsights: InsightResolutionResult;
    resolvedDisplayForms: DisplayFormResolutionResult;
    listedDashboardMap: ObjRefMap<IListedDashboard>;
}

export function* getValidationData(
    widgetRef: ObjRef,
    drillsToModify: InsightDrillDefinition[],
    ctx: DashboardContext,
): SagaIterator<DrillDefinitionValidationData> {
    const selectDrillTargetsByWidgetRefSelector = selectDrillTargetsByWidgetRef(widgetRef);
    const drillTargets: ReturnType<typeof selectDrillTargetsByWidgetRefSelector> = yield select(
        selectDrillTargetsByWidgetRefSelector,
    );

    const listedDashboardMap: ReturnType<typeof selectListedDashboardsMap> = yield select(
        selectListedDashboardsMap,
    );

    const insightRefs = extractInsightRefs(drillsToModify);
    const resolvedInsights: SagaReturnType<typeof resolveInsights> = yield call(
        resolveInsights,
        ctx,
        insightRefs,
    );

    const displayFormIds = extractDisplayFormIdentifiers(drillsToModify);
    const resolvedDisplayForms: SagaReturnType<typeof resolveDisplayFormMetadata> = yield call(
        resolveDisplayFormMetadata,
        ctx,
        displayFormIds,
    );

    return {
        drillTargets,
        listedDashboardMap,
        resolvedInsights,
        resolvedDisplayForms,
    };
}
