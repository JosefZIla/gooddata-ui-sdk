// (C) 2007-2023 GoodData Corporation
import { CatalogExportConfig } from "./types";

export const DEFAULT_HOSTNAME = "https://secure.gooddata.com";
export const DEFAULT_CONFIG_FILE_NAME = ".gdcatalogrc";
export const DEFAULT_OUTPUT_FILE_NAME = "catalog.ts";

export const DEFAULT_CONFIG: CatalogExportConfig = {
    hostname: null,
    workspaceId: null,
    username: null,
    password: null,
    output: null,
    backend: "tiger",
    demo: false,
};
