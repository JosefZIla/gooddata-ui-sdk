// (C) 2020 GoodData Corporation
import React, { useCallback, useState } from "react";
import { IInsightWidget } from "@gooddata/sdk-backend-spi";
import { IInsight, insightTitle } from "@gooddata/sdk-model";
import { FullScreenOverlay, Overlay, useMediaQuery } from "@gooddata/sdk-ui-kit";
import { ILocale, OnLoadingChanged } from "@gooddata/sdk-ui";
import { DOWNLOADER_ID } from "../../../../../_staging/fileUtils/downloadFile";
import { useInsightExport } from "../../../common";
import { OnDrillDownSuccess, WithDrillSelect } from "../../../../drill";
import { IntlWrapper } from "../../../../localization";
import { DrillDialog } from "./DrillDialog";
import { DrillDialogInsight } from "./DrillDialogInsight";
import { DRILL_MODAL_EXECUTION_PSEUDO_REF, useWidgetExecutionsHandler } from "../../../../../model";

/**
 * @internal
 */
export interface InsightDrillDialogProps {
    locale: ILocale;
    breadcrumbs: string[];
    widget: IInsightWidget;
    insight: IInsight;
    onDrillDown?: OnDrillDownSuccess;
    onClose: () => void;
    onBackButtonClick: () => void;
}

const overlayIgnoredClasses = [
    ".s-sort-direction-arrow",
    ".gd-export-dialog",
    ".options-menu-export-xlsx",
    ".options-menu-export-csv",
    `#${DOWNLOADER_ID}`,
];

export const InsightDrillDialog = (props: InsightDrillDialogProps): JSX.Element => {
    const { locale, breadcrumbs, insight, onClose, onBackButtonClick, onDrillDown } = props;

    const isMobileDevice = useMediaQuery("mobileDevice");

    const [isLoading, setIsLoading] = useState(false);

    const executionsHandler = useWidgetExecutionsHandler(DRILL_MODAL_EXECUTION_PSEUDO_REF);

    const handleLoadingChanged = useCallback<OnLoadingChanged>(({ isLoading }) => {
        setIsLoading(isLoading);
        executionsHandler.onLoadingChanged({ isLoading });
    }, []);

    const modalTitle = insightTitle(insight);

    const { exportCSVEnabled, exportXLSXEnabled, onExportCSV, onExportXLSX } = useInsightExport({
        title: modalTitle,
        widgetRef: DRILL_MODAL_EXECUTION_PSEUDO_REF,
    });

    const OverlayComponent = isMobileDevice ? FullScreenOverlay : Overlay;

    return (
        <OverlayComponent
            className="gd-drill-modal-overlay"
            isModal
            closeOnEscape
            closeOnOutsideClick
            ignoreClicksOnByClass={overlayIgnoredClasses}
            onClose={onClose}
            positionType="fixed"
        >
            <IntlWrapper locale={locale}>
                <DrillDialog
                    title={modalTitle}
                    isBackButtonVisible={breadcrumbs.length > 1}
                    onBackButtonClick={onBackButtonClick}
                    onCloseDialog={onClose}
                    breadcrumbs={breadcrumbs}
                    exportAvailable={exportXLSXEnabled || exportCSVEnabled}
                    exportXLSXEnabled={exportXLSXEnabled}
                    exportCSVEnabled={exportCSVEnabled}
                    onExportXLSX={onExportXLSX}
                    onExportCSV={onExportCSV}
                    isLoading={isLoading}
                >
                    <WithDrillSelect insight={props.insight} onDrillDownSuccess={onDrillDown}>
                        {({ onDrill }) => {
                            return (
                                <DrillDialogInsight
                                    {...props}
                                    onDrill={onDrill}
                                    onLoadingChanged={handleLoadingChanged}
                                    onError={executionsHandler.onError}
                                    pushData={executionsHandler.onPushData}
                                />
                            );
                        }}
                    </WithDrillSelect>
                </DrillDialog>
            </IntlWrapper>
        </OverlayComponent>
    );
};
