// (C) 2019-2023 GoodData Corporation
import { GdcFilterContext } from "../GdcFilterContext";

export const relativeDateFilter: GdcFilterContext.FilterContextItem = {
    dateFilter: {
        type: "relative",
        from: "-11",
        to: "0",
        granularity: "GDC.time.month",
    },
};

export const absoluteDateFilter: GdcFilterContext.FilterContextItem = {
    dateFilter: {
        type: "absolute",
        from: "2019-08-06",
        to: "2019-08-08",
        granularity: "GDC.time.month",
    },
};

export const attributeFilter: GdcFilterContext.FilterContextItem = {
    attributeFilter: {
        displayForm: "/gdc/md/testProjectId/obj/700",
        negativeSelection: false,
        attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
    },
};

export const singleSelectionAttributeFilter: GdcFilterContext.FilterContextItem = {
    attributeFilter: {
        displayForm: "/gdc/md/testProjectId/obj/700",
        negativeSelection: false,
        attributeElements: ["/gdc/md/testProjectId/obj/750"],
        selectionMode: "single",
    },
};

export const dependentAttributeFilter: GdcFilterContext.FilterContextItem = {
    attributeFilter: {
        displayForm: "/gdc/md/testProjectId/obj/700",
        negativeSelection: false,
        attributeElements: ["/gdc/md/testProjectId/obj/750", "/gdc/md/testProjectId/obj/751"],
        localIdentifier: "locId1",
        filterElementsBy: [
            {
                filterLocalIdentifier: "locId2",
                over: {
                    attributes: ["connectiong/attribute"],
                },
            },
        ],
    },
};

export const dateFilterWithUndefinedRange: GdcFilterContext.FilterContextItem = {
    dateFilter: {
        type: "relative",
        from: undefined,
        to: undefined,
        granularity: "GDC.time.month",
    },
};
