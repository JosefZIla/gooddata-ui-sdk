// (C) 2021 GoodData Corporation
import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "redux-saga";
import { MoveAttributeFilter } from "../../../commands/filters";
import { invalidArgumentsProvided } from "../../../events/general";
import { attributeFilterMoved } from "../../../events/filters";
import { filterContextActions } from "../../../state/filterContext";
import {
    selectFilterContextAttributeFilterByLocalId,
    selectFilterContextAttributeFilterIndexByLocalId,
    selectFilterContextFilters,
} from "../../../state/filterContext/filterContextSelectors";
import { DashboardContext } from "../../../types/commonTypes";
import { dispatchFilterContextChanged } from "../common";
import { dispatchDashboardEvent } from "../../../state/_infra/eventDispatcher";

export function* moveAttributeFilterHandler(
    ctx: DashboardContext,
    cmd: MoveAttributeFilter,
): SagaIterator<void> {
    const { filterLocalId, index } = cmd.payload;

    // validate filterLocalId
    const affectedFilter: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterByLocalId>> =
        yield select(selectFilterContextAttributeFilterByLocalId(filterLocalId));

    if (!affectedFilter) {
        throw invalidArgumentsProvided(ctx, cmd, `Filter with filterLocalId ${filterLocalId} not found.`);
    }

    // validate target index
    const allFilters: ReturnType<typeof selectFilterContextFilters> = yield select(
        selectFilterContextFilters,
    );

    const maximalTargetIndex = allFilters.length - 1;

    if (index > maximalTargetIndex || index < -1) {
        throw invalidArgumentsProvided(
            ctx,
            cmd,
            `Invalid index (${index}) provided, it must be between -1 and ${maximalTargetIndex}`,
        );
    }

    const originalIndex: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterIndexByLocalId>> =
        yield select(selectFilterContextAttributeFilterIndexByLocalId(filterLocalId));

    yield put(
        filterContextActions.moveAttributeFilter({
            filterLocalId,
            index,
        }),
    );

    const finalIndex: ReturnType<ReturnType<typeof selectFilterContextAttributeFilterIndexByLocalId>> =
        yield select(selectFilterContextAttributeFilterIndexByLocalId(filterLocalId));

    yield dispatchDashboardEvent(
        attributeFilterMoved(ctx, affectedFilter, originalIndex, finalIndex, cmd.correlationId),
    );
    yield call(dispatchFilterContextChanged, ctx, cmd);
}
