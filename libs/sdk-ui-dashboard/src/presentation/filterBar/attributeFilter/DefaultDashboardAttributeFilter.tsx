// (C) 2021 GoodData Corporation
import React from "react";
import { AttributeFilterButton, IAttributeDropdownBodyExtendedProps } from "@gooddata/sdk-ui-filters";

import {
    attributeFilterToDashboardAttributeFilter,
    dashboardAttributeFilterToAttributeFilter,
} from "../../../_staging/dashboard/dashboardFilterConverter";

import {
    DashboardAttributeFilterPropsProvider,
    useDashboardAttributeFilterProps,
} from "./DashboardAttributeFilterPropsContext";
import { IDashboardAttributeFilterProps } from "./types";
import { AttributeFilterBody } from "./dashboardDropdownBody/AttributeFilterBody";
import { useParentFilters } from "./useParentFilters";
import { selectLocale, useDashboardSelector } from "../../../model";

/**
 * @internal
 */
export const DefaultDashboardAttributeFilterInner = (): JSX.Element => {
    const { filter, onFilterChanged } = useDashboardAttributeFilterProps();
    const { parentFilters, parentFilterOverAttribute } = useParentFilters(filter);
    const locale = useDashboardSelector(selectLocale);

    return (
        <AttributeFilterButton
            // TODO: https://jira.intgdc.com/browse/RAIL-2174
            // AttributeFilterButton is not updated after attribute filter elements change.
            // Same issue is in the AttributeFilter.
            filter={dashboardAttributeFilterToAttributeFilter(filter)}
            onApply={(newFilter) => {
                onFilterChanged(
                    attributeFilterToDashboardAttributeFilter(
                        newFilter,
                        filter.attributeFilter.localIdentifier,
                    ),
                );
            }}
            renderBody={(filterBodyProps: IAttributeDropdownBodyExtendedProps) => {
                return <AttributeFilterBody {...filterBodyProps} />;
            }}
            parentFilters={parentFilters}
            parentFilterOverAttribute={parentFilterOverAttribute}
            locale={locale}
        />
    );
};

/**
 * Default implementation of the attribute filter to use on the dashboard's filter bar.
 *
 * This will use the SDK's AttributeFilter with the button styled same as we have it today on KD.
 *
 * @alpha
 */
export const DefaultDashboardAttributeFilter = (props: IDashboardAttributeFilterProps): JSX.Element => {
    return (
        <DashboardAttributeFilterPropsProvider {...props}>
            <DefaultDashboardAttributeFilterInner />
        </DashboardAttributeFilterPropsProvider>
    );
};
