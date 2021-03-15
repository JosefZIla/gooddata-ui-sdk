// (C) 2007-2021 GoodData Corporation

import { CatalogExportConfig, CatalogExportError, ProjectMetadata } from "../../base/types";
import { DEFAULT_HOSTNAME } from "../../base/constants";
import * as pkg from "../../../package.json";
import ora from "ora";
import { log, logError } from "../../cli/loggers";
import { promptPassword, promptProjectId, promptUsername } from "../../cli/prompts";
import { clearLine } from "../../cli/clear";
import gooddata, { SDK } from "@gooddata/api-client-bear";
import { bearLoad } from "./bearLoad";

async function selectBearWorkspace(client: SDK): Promise<string> {
    const metadataResponse = await client.xhr.get("/gdc/md");
    const metadata = metadataResponse.getData();
    const projectChoices = metadata.about.links.map((link: any) => {
        return {
            name: link.title,
            value: link.identifier,
        };
    });

    return promptProjectId(projectChoices);
}

/**
 * Given the export config, ask for any missing information and then load project metadata from
 * a bear project.
 *
 * @param config - tool configuration, may be missing username, password and project id - in that case code
 *  will promp
 *
 * @returns loaded project metadata
 *
 * @throws CatalogExportError upon any error.
 */
export async function loadProjectMetadataFromBear(config: CatalogExportConfig): Promise<ProjectMetadata> {
    const { projectName, hostname } = config;
    let { projectId, username, password } = config;

    gooddata.config.setCustomDomain(hostname || DEFAULT_HOSTNAME);
    gooddata.config.setJsPackage(pkg.name, pkg.version);

    const logInSpinner = ora();
    try {
        if (username) {
            log("Username", username);
        } else {
            username = await promptUsername();
        }

        password = password || (await promptPassword());

        logInSpinner.start("Logging in...");
        await gooddata.user.login(username, password);
        logInSpinner.stop();
        clearLine();
    } catch (err) {
        logInSpinner.fail();
        clearLine();

        if (err.message && err.message.search(/.*(certificate|self-signed).*/) > -1) {
            logError(
                "Server does not have valid certificate. The login has failed. " +
                    "If you trust the server, you can use the --accept-untrusted-ssl option " +
                    "to turn off certificate validation.",
            );
        }

        throw new CatalogExportError(`Unable to log in to platform. The error was: ${err}`, 1);
    }

    const projectSpinner = ora();
    try {
        if (projectName && !projectId) {
            log("Project Name", projectName);
            projectSpinner.start("Loading project");
            const metadataResponse = await gooddata.xhr.get("/gdc/md");
            const metadata = metadataResponse.getData();
            projectSpinner.stop();
            const projectMetadata = metadata.about
                ? metadata.about.links.find((link: any) => {
                      return link.title === projectName;
                  })
                : null;
            if (projectMetadata) {
                projectId = projectMetadata.identifier;
            } else {
                logError(`Could not find a project with name '${projectName}'`);
            }
        }
        if (projectId) {
            log("Project ID", projectId);
        } else {
            projectId = await selectBearWorkspace(gooddata);
        }

        return bearLoad(projectId);
    } catch (err) {
        projectSpinner.stop();

        throw new CatalogExportError(
            `Unable to obtain project metadata from platform. The error was: ${err}`,
            1,
        );
    }
}
