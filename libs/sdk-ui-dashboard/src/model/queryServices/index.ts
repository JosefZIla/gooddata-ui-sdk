// (C) 2021 GoodData Corporation
import { QueryDateDatasetsForInsightService } from "./queryInsightDateDatasets";
import { QueryInsightAttributesMetaService } from "./queryInsightAttributesMeta";
import { QueryWidgetFiltersService } from "./queryWidgetFilters";
import { QueryDateDatasetsForMeasureService } from "./queryMeasureDateDatasets";
import { QueryWidgetBrokenAlertService } from "./queryWidgetBrokenAlerts";

export const AllQueryServices = [
    QueryDateDatasetsForInsightService,
    QueryInsightAttributesMetaService,
    QueryWidgetFiltersService,
    QueryDateDatasetsForMeasureService,
    QueryWidgetBrokenAlertService,
];
