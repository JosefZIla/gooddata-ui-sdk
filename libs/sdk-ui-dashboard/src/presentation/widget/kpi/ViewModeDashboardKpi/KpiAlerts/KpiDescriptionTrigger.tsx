// (C) 2022 GoodData Corporation
import React from "react";

import { DescriptionPanel } from "@gooddata/sdk-ui-kit";
import { ICatalogMeasure, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { IKpiDescriptionTriggerProps } from "./types";
import { useDashboardSelector, selectCatalogMeasures } from "../../../../../model";

const getKpiMetricDescription = (metrics: ICatalogMeasure[], ref: ObjRef): string | undefined => {
    return metrics.find((metric) => areObjRefsEqual(metric.measure.ref, ref))?.measure.description;
};

export const KpiDescriptionTrigger: React.FC<IKpiDescriptionTriggerProps> = (props) => {
    const { kpi } = props;
    const visible = kpi.configuration?.description?.visible ?? true;
    const metrics = useDashboardSelector(selectCatalogMeasures);

    const description =
        kpi.configuration?.description?.source === "kpi"
            ? kpi.description
            : getKpiMetricDescription(metrics, kpi.kpi.metric);

    const trimmedDescription = description?.trim();

    if (visible && trimmedDescription && trimmedDescription !== "") {
        return (
            <div className="dash-item-action-description">
                <DescriptionPanel
                    description={trimmedDescription}
                    className="dash-item-action-description-trigger"
                />
            </div>
        );
    }
    return null;
};
