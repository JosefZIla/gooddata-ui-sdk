// (C) 2021-2022 GoodData Corporation
import { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { DashboardContext } from "../../types/commonTypes";
import { ChangeRenderMode, resetDashboard as resetDashboardCommand } from "../../commands";
import { DashboardRenderModeChanged } from "../../events";
import { renderModeChanged } from "../../events/renderMode";
import { renderModeActions } from "../../store/renderMode";
import { selectDashboardEditModeDevRollout } from "../../store/config/configSelectors";
import { resetDashboardHandler } from "../dashboard/resetDashboardHandler";
import { validateDrills } from "../common/validateDrills";
import { selectAllAnalyticalWidgets } from "../../store/layout/layoutSelectors";
import { validateDrillToCustomUrlParams } from "../common/validateDrillToCustomUrlParams";
import { isInsightWidget } from "@gooddata/sdk-model";

export function* changeRenderModeHandler(
    ctx: DashboardContext,
    cmd: ChangeRenderMode,
): SagaIterator<DashboardRenderModeChanged> {
    const {
        payload: { renderMode, renderModeChangeOptions },
        correlationId,
    } = cmd;

    const editModeEnabled = yield select(selectDashboardEditModeDevRollout);

    if (renderMode === "view" || editModeEnabled) {
        yield put(renderModeActions.setRenderMode(renderMode));

        if (renderModeChangeOptions.resetDashboard) {
            yield call(resetDashboardHandler, ctx, resetDashboardCommand(correlationId));
        }

        if (renderMode === "edit") {
            const widgets: ReturnType<typeof selectAllAnalyticalWidgets> = yield select(
                selectAllAnalyticalWidgets,
            );
            yield call(validateDrills, ctx, cmd, widgets);
            yield call(validateDrillToCustomUrlParams, widgets.filter(isInsightWidget));
        }

        return renderModeChanged(ctx, renderMode, correlationId);
    } else {
        return renderModeChanged(ctx, "view", correlationId);
    }
}
