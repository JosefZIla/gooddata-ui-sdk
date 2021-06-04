// (C) 2021 GoodData Corporation
import {
    IUserWorkspaceSettings,
    IWorkspaceSettings,
    IWorkspaceSettingsService,
} from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export abstract class DecoratedWorkspaceSettingsService implements IWorkspaceSettingsService {
    protected constructor(protected decorated: IWorkspaceSettingsService) {}

    async getSettings(): Promise<IWorkspaceSettings> {
        return this.decorated.getSettings();
    }

    async getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return this.decorated.getSettingsForCurrentUser();
    }
}
