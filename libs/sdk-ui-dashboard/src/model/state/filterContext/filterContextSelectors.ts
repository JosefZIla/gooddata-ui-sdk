// (C) 2021 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { DashboardState } from "../types";
import invariant from "ts-invariant";
import memoize from "lodash/memoize";
import {
    FilterContextItem,
    IDashboardAttributeFilter,
    IDashboardDateFilter,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
} from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, ObjRef, serializeObjRef } from "@gooddata/sdk-model";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.filterContext,
);

/**
 * This selector returns dashboard's filter context definition. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextDefinition = createSelector(selectSelf, (filterContextState) => {
    invariant(
        filterContextState.filterContextDefinition,
        "attempting to access uninitialized filter context state",
    );

    return filterContextState.filterContextDefinition!;
});

/**
 * Selects dashboard's filter context identity.
 *
 * The identity may be undefined in two circumstances:
 *
 * -  a new, yet unsaved dashboard; the filter context is saved together with the dashboard and after the
 *    save the identity will be known and added
 * -  export of an existing, saved dashboard; during the export the dashboard receives a temporary
 *    filter context that represents values of filters at the time the export was initiated - which may
 *    be different from what is saved in the filter context itself. that temporary context is not
 *    persistent and lives only for that particular export operation.
 *
 * @alpha
 */
export const selectFilterContextIdentity = createSelector(selectSelf, (filterContextState) => {
    // this is intentional; want to fail fast when trying to access an optional identity of filter context \
    // but there is actually no filter context initialized for the dashboard
    invariant(
        filterContextState.filterContextDefinition,
        "attempting to access uninitialized filter context state",
    );

    return filterContextState.filterContextIdentity;
});

/**
 * This selector returns dashboard's filter context filters. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextFilters = createSelector(
    selectFilterContextDefinition,
    (filterContext): FilterContextItem[] => filterContext.filters,
);

/**
 * This selector returns dashboard's filter context attribute filters. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextAttributeFilters = createSelector(
    selectFilterContextFilters,
    (filters): IDashboardAttributeFilter[] => filters.filter(isDashboardAttributeFilter),
);

/**
 * This selector returns dashboard's filter context date filter. It is expected that the selector is called only after the filter
 * context state is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @alpha
 */
export const selectFilterContextDateFilter = createSelector(
    selectFilterContextFilters,
    (filters): IDashboardDateFilter | undefined => filters.find(isDashboardDateFilter),
);

/**
 * Creates a selector for selecting attribute filter by its displayForm {@link @gooddata/sdk-model#ObjRef}.
 *
 * @alpha
 */
export const selectFilterContextAttributeFilterByDisplayForm = memoize(
    (displayForm: ObjRef) =>
        createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
            attributeFilters.find((filter) =>
                areObjRefsEqual(filter.attributeFilter.displayForm, displayForm),
            ),
        ),
    (ref) => ref && serializeObjRef(ref),
);

/**
 * Creates a selector for selecting attribute filter by its localId.
 *
 * @alpha
 */
export const selectFilterContextAttributeFilterByLocalId = memoize((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.find((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);

/**
 * Creates a selector for selecting attribute filter index by its localId.
 *
 *
 * @alpha
 */
export const selectFilterContextAttributeFilterIndexByLocalId = memoize((localId: string) =>
    createSelector(selectFilterContextAttributeFilters, (attributeFilters) =>
        attributeFilters.findIndex((filter) => filter.attributeFilter.localIdentifier === localId),
    ),
);
