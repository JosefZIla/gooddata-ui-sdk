// (C) 2021 GoodData Corporation

import { createSlice } from "@reduxjs/toolkit";
import { alertsAdapter } from "./alertsEntityAdapter";

const alertsSlice = createSlice({
    name: "alerts",
    initialState: alertsAdapter.getInitialState(),
    reducers: {
        setAlerts: alertsAdapter.setAll,
        addAlert: alertsAdapter.addOne,
        updateAlert: alertsAdapter.updateOne,
        removeAlert: alertsAdapter.removeOne,
    },
});

export const alertsSliceReducer = alertsSlice.reducer;
export const alertsActions = alertsSlice.actions;
