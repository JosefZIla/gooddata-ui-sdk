// (C) 2007-2018 GoodData Corporation
import { storiesOf } from "@storybook/react";
import React from "react";
import { PivotTable, IPivotTableProps } from "@gooddata/sdk-ui-pivot";
import { PivotTableWithSingleMeasureAndTwoRowsAndCols } from "../../../../scenarios/pivotTable/base";
import { withScreenshot, withMultipleScreenshots } from "../../../_infra/backstopWrapper";
import { CustomStories } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";

import "@gooddata/sdk-ui-pivot/styles/css/main.css";
import "@gooddata/sdk-ui-pivot/styles/css/pivotTable.css";
import { StorybookBackend, ReferenceWorkspaceId } from "../../../_infra/backend";
import { action } from "@storybook/addon-actions";
import { createElementCountResolver, ScreenshotReadyWrapper } from "../../../_infra/ScreenshotReadyWrapper";
import { AmountMeasurePredicate } from "../../../../scenarios/_infra/predicates";

const backend = StorybookBackend();

const PivotTableTest = (config: Partial<IPivotTableProps> = {}) => (
    <div
        style={{
            width: 800,
            height: 400,
            padding: 10,
            border: "solid 1px #000000",
            resize: "both",
            overflow: "auto",
        }}
        className="s-table"
    >
        <PivotTable
            backend={backend}
            workspace={ReferenceWorkspaceId}
            measures={PivotTableWithSingleMeasureAndTwoRowsAndCols.measures}
            rows={PivotTableWithSingleMeasureAndTwoRowsAndCols.rows}
            columns={PivotTableWithSingleMeasureAndTwoRowsAndCols.columns}
            config={{
                menu: {
                    aggregations: true,
                    aggregationsSubMenu: true,
                },
                columnSizing: {
                    defaultWidth: "viewport",
                },
            }}
            onColumnResized={action("columnResized")}
            {...config}
        />
    </div>
);

storiesOf(`${CustomStories}/Pivot Table`, module).add("table with resizing", () =>
    withScreenshot(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest />,
        </ScreenshotReadyWrapper>,
    ),
);

storiesOf(`${CustomStories}/Pivot Table`, module).add("themed", () =>
    withScreenshot(
        wrapWithTheme(
            <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
                <PivotTableTest />,
            </ScreenshotReadyWrapper>,
        ),
        {
            hoverSelector:
                ".s-table-measure-column-header-group-cell-0.s-table-measure-column-header-cell-0.s-table-measure-column-header-index-2",
            postInteractionWait: 200,
        },
    ),
);

storiesOf(`${CustomStories}/Pivot Table`, module).add("drill underline style", () =>
    withMultipleScreenshots(
        <ScreenshotReadyWrapper resolver={createElementCountResolver(1)}>
            <PivotTableTest drillableItems={[AmountMeasurePredicate]} />,
        </ScreenshotReadyWrapper>,
        {
            "standard cell": {
                hoverSelector: ".s-cell-1-2",
                postInteractionWait: 1000,
            },
            "empty cell": {
                hoverSelector: ".s-cell-3-2",
                postInteractionWait: 1000,
            },
        },
    ),
);
