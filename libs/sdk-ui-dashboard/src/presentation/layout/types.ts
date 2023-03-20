// (C) 2020-2023 GoodData Corporation
import { ComponentType } from "react";
import { IErrorProps, OnError } from "@gooddata/sdk-ui";
import { FilterContextItem } from "@gooddata/sdk-model";

import { OnFiredDashboardDrillEvent } from "../../types";

/**
 * @alpha
 */
export interface IDashboardLayoutProps {
    ErrorComponent?: React.ComponentType<IErrorProps>;
    // TODO: is this necessary? (there are events for it)
    onFiltersChange?: (filters: FilterContextItem[], resetOthers?: boolean) => void;
    onDrill?: OnFiredDashboardDrillEvent;
    onError?: OnError;
}

/**
 * @alpha
 */
export type CustomDashboardLayoutComponent = ComponentType<IDashboardLayoutProps>;

/**
 * @internal
 */
export type CustomEmptyLayoutDropZoneBodyComponent = ComponentType;
