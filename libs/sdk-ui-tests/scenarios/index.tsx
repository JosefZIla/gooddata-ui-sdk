// (C) 2007-2019 GoodData Corporation

import chartScenarios from "./charts";
import geoScenarios, { latitudeLongitudeScenarios } from "./geo";
import pivotScenarios from "./pivotTable";
import executeScenarios from "./execute/base";

export default [
    ...chartScenarios,
    ...geoScenarios,
    ...latitudeLongitudeScenarios,
    ...pivotScenarios,
    executeScenarios,
];
