// (C) 2021-2022 GoodData Corporation
import React, { useEffect } from "react";
import { ToastMessages, useToastMessage } from "@gooddata/sdk-ui-kit";

import { ExportDialogProvider } from "../../dialogs";
import { TopBar, useTopBarProps } from "../../topBar";
import { SaveAsDialog, useSaveAsDialogProps } from "../../saveAs";
import { FilterBar, useFilterBarProps } from "../../filterBar";
import { ShareDialogDashboardHeader } from "./ShareDialogDashboardHeader";
import { ScheduledEmailDialogProvider } from "./ScheduledEmailDialogProvider";
import { DeleteDialog, useDeleteDialogProps } from "../../deleteDialog";
import { KpiDeleteDialog, useKpiDeleteDialogProps } from "../../kpiDeleteDialog";
import { CancelEditDialog, useCancelEditDialog } from "../../cancelEditDialog";
import { DrillValidationToastMessages } from "../components/DrillValidationToastMessages";
import { selectRenderMode, useDashboardSelector } from "../../../model";

// these wrapper components are here to prevent the whole DashboardHeader from re-rendering whenever some
// of the sub-components' props change. by isolating the hooks more, we make sure only the really changed component re-renders.
const DeleteDialogWrapper = () => {
    const deleteDialogProps = useDeleteDialogProps();
    return <DeleteDialog {...deleteDialogProps} />;
};

const KpiDeleteDialogWrapper = () => {
    const kpiDeleteDialogProps = useKpiDeleteDialogProps();
    return <KpiDeleteDialog {...kpiDeleteDialogProps} />;
};

const SaveAsDialogWrapper = () => {
    const saveAsDialogProps = useSaveAsDialogProps();
    return <SaveAsDialog {...saveAsDialogProps} />;
};

const TopBarWrapper = () => {
    const topBarProps = useTopBarProps();
    return <TopBar {...topBarProps} />;
};

const FilterBarWrapper = () => {
    const filterBarProps = useFilterBarProps();
    return <FilterBar {...filterBarProps} />;
};

const CancelEditDialogWrapper = () => {
    const cancelEditDialogProps = useCancelEditDialog();
    return <CancelEditDialog {...cancelEditDialogProps} />;
};

// split the header parts of the dashboard so that changes to their state
// (e.g. opening email dialog) do not re-render the dashboard body
export const DashboardHeader = (): JSX.Element => {
    const { removeAllMessages } = useToastMessage();
    const renderMode = useDashboardSelector(selectRenderMode);

    // remove all messages whenever the render mode changes
    useEffect(() => {
        removeAllMessages();
    }, [renderMode]);

    return (
        <>
            <ToastMessages />
            <DrillValidationToastMessages />
            <ExportDialogProvider />
            <ScheduledEmailDialogProvider />
            <ShareDialogDashboardHeader />
            <DeleteDialogWrapper />
            <KpiDeleteDialogWrapper />
            <SaveAsDialogWrapper />
            <TopBarWrapper />
            <FilterBarWrapper />
            <CancelEditDialogWrapper />
        </>
    );
};
