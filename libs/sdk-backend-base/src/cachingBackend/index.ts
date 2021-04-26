// (C) 2007-2021 GoodData Corporation
import {
    IAnalyticalBackend,
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
    ValidationContext,
    ISecuritySettingsService,
} from "@gooddata/sdk-backend-spi";
import {
    CatalogDecoratorFactory,
    decoratedBackend,
    ExecutionDecoratorFactory,
    SecuritySettingsDecoratorFactory,
} from "../decoratedBackend";
import LRUCache from "lru-cache";
import { DecoratedSecuritySettingsService } from "../decoratedBackend/securitySettings";
import {
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    PreparedExecutionWrapper,
    DecoratedDataView,
} from "../decoratedBackend/execution";
import { DecoratedWorkspaceCatalogFactory } from "../decoratedBackend/catalog";
import stringify from "json-stable-stringify";
import identity from "lodash/identity";
import invariant from "ts-invariant";
import { IExecutionDefinition } from "@gooddata/sdk-model";

//
// Supporting types
//

type ExecutionCacheEntry = {
    result: Promise<IExecutionResult>;
};

type CatalogCacheEntry = {
    catalogForOptions: LRUCache<string, Promise<IWorkspaceCatalog>>;
};

type SecuritySettingsCacheEntry = {
    valid: LRUCache<string, Promise<boolean>>;
};

type CachingContext = {
    caches: {
        execution?: LRUCache<string, ExecutionCacheEntry>;
        workspaceCatalogs?: LRUCache<string, CatalogCacheEntry>;
        securitySettings?: LRUCache<string, SecuritySettingsCacheEntry>;
    };
    config: CachingConfiguration;
};

//
// Execution caching
//

class WithExecutionCaching extends DecoratedPreparedExecution {
    constructor(decorated: IPreparedExecution, private readonly ctx: CachingContext) {
        super(decorated);
    }

    public execute = async (): Promise<IExecutionResult> => {
        const cacheKey = this.fingerprint();
        const cache = this.ctx.caches.execution!;
        let cacheEntry = cache.get(cacheKey);

        if (!cacheEntry) {
            const result = super
                .execute()
                .then((res) => {
                    return new WithExecutionResultCaching(res, this.createNew, this.ctx);
                })
                .catch((e) => {
                    cache.del(cacheKey);
                    throw e;
                });

            cacheEntry = { result };
            cache.set(cacheKey, cacheEntry);
        }

        return new DefinitionSanitizingExecutionResult(
            await cacheEntry.result,
            this.createNew,
            this.definition,
        );
    };

    protected createNew = (decorated: IPreparedExecution): IPreparedExecution => {
        return new WithExecutionCaching(decorated, this.ctx);
    };
}

/**
 * This DataView decorator makes sure that definition used in it is the same as the definition in the result.
 *
 * See the usage of this class in {@link DefinitionSanitizingExecutionResult} for more.
 */
class DefinitionSanitizingDataView extends DecoratedDataView {
    constructor(decorated: IDataView, result: IExecutionResult) {
        super(decorated, result);
        this.definition = result.definition;
    }
}

/**
 * This ExecutionResult decorator makes sure that definitions used throughout the result are set
 * to the definitionOverride provided. This is useful with caching because different definitions may yield
 * the same cache key, but having the proper definition in the returned execution result is critical:
 * the definitions in the result must match the one which was used to request it.
 * This however is not always the case when using cached results, so we need to ensure it explicitly.
 *
 * See the usage of this class in {@link WithExecutionCaching} for more.
 */
class DefinitionSanitizingExecutionResult extends DecoratedExecutionResult {
    constructor(
        decorated: IExecutionResult,
        wrapper: PreparedExecutionWrapper,
        definitionOverride: IExecutionDefinition,
    ) {
        super(decorated, wrapper);
        this.definition = definitionOverride;
    }

    public readAll = async (): Promise<IDataView> => {
        return this.withSanitizedDefinition(await super.readAll());
    };

    public readWindow = async (offset: number[], size: number[]): Promise<IDataView> => {
        return this.withSanitizedDefinition(await super.readWindow(offset, size));
    };

    private withSanitizedDefinition = (original: IDataView): IDataView => {
        return new DefinitionSanitizingDataView(original, this);
    };
}

function windowKey(offset: number[], size: number[]): string {
    return `o(${offset.join(",")})_s(${size.join(",")})`;
}

class WithExecutionResultCaching extends DecoratedExecutionResult {
    private allData: Promise<IDataView> | undefined;
    private windows: LRUCache<string, Promise<IDataView>> | undefined;

    constructor(
        decorated: IExecutionResult,
        wrapper: PreparedExecutionWrapper,
        private readonly ctx: CachingContext,
    ) {
        super(decorated, wrapper);

        if (cachingEnabled(this.ctx.config.maxResultWindows)) {
            this.windows = new LRUCache({ max: this.ctx.config.maxResultWindows });
        }
    }

    public readAll = (): Promise<IDataView> => {
        if (!this.allData) {
            this.allData = super.readAll().catch((e) => {
                this.allData = undefined;
                throw e;
            });
        }

        return this.allData;
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        if (!this.windows) {
            return super.readWindow(offset, size);
        }

        const cacheKey = windowKey(offset, size);
        let window: Promise<IDataView> | undefined = this.windows.get(cacheKey);

        if (!window) {
            window = super.readWindow(offset, size).catch((e) => {
                if (this.windows) {
                    this.windows.del(cacheKey);
                }

                throw e;
            });
            this.windows.set(cacheKey, window);
        }

        return window;
    };
}

//
// Catalog caching
//

function optionsKey(options: IWorkspaceCatalogFactoryOptions): string {
    return stringify(options);
}

class WithCatalogCaching extends DecoratedWorkspaceCatalogFactory {
    constructor(decorated: IWorkspaceCatalogFactory, private readonly ctx: CachingContext) {
        super(decorated);
    }

    public load = (): Promise<IWorkspaceCatalog> => {
        const cache = this.getOrCreateWorkspaceEntry(this.workspace).catalogForOptions;
        const cacheKey = optionsKey(this.options);
        let catalog = cache.get(cacheKey);

        if (!catalog) {
            catalog = super.load().catch((e) => {
                cache.del(cacheKey);
                throw e;
            });

            cache.set(cacheKey, catalog);
        }

        return catalog;
    };

    protected createNew = (decorated: IWorkspaceCatalogFactory): IWorkspaceCatalogFactory => {
        return new WithCatalogCaching(decorated, this.ctx);
    };

    private getOrCreateWorkspaceEntry = (workspace: string): CatalogCacheEntry => {
        const cache = this.ctx.caches.workspaceCatalogs!;
        let cacheEntry = cache.get(workspace);

        if (!cacheEntry) {
            cacheEntry = {
                catalogForOptions: new LRUCache<string, Promise<IWorkspaceCatalog>>({
                    max: this.ctx.config.maxCatalogOptions,
                }),
            };
            cache.set(workspace, cacheEntry);
        }

        return cacheEntry;
    };
}

//
// Organization security settings caching
//

function validUrlInContextKey(url: string, context: ValidationContext): string {
    return `${context}_${stringify(url)}`;
}

class WithSecuritySettingsCaching extends DecoratedSecuritySettingsService {
    constructor(decorated: ISecuritySettingsService, private readonly ctx: CachingContext) {
        super(decorated);
    }

    public isUrlValid = (url: string, context: ValidationContext): Promise<boolean> => {
        const cache = this.getOrCreateSecuritySettingsEntry(this.scope).valid;
        const cacheKey = validUrlInContextKey(url, context);
        let result = cache.get(cacheKey);

        if (!result) {
            result = super.isUrlValid(url, context).catch((e) => {
                cache.del(cacheKey);
                throw e;
            });

            cache.set(cacheKey, result);
        }

        return result;
    };

    private getOrCreateSecuritySettingsEntry = (scope: string): SecuritySettingsCacheEntry => {
        const cache = this.ctx.caches.securitySettings!;
        let cacheEntry = cache.get(scope);

        if (!cacheEntry) {
            cacheEntry = {
                valid: new LRUCache<string, Promise<boolean>>({
                    max: this.ctx.config.maxSecuritySettingsOrgUrls,
                    maxAge: this.ctx.config.maxSecuritySettingsOrgUrlsAge,
                }),
            };
            cache.set(scope, cacheEntry);
        }

        return cacheEntry;
    };
}

//
//
//

function cachedExecutions(ctx: CachingContext): ExecutionDecoratorFactory {
    return (original: IExecutionFactory) =>
        new DecoratedExecutionFactory(original, (execution) => new WithExecutionCaching(execution, ctx));
}

function cachedCatalog(ctx: CachingContext): CatalogDecoratorFactory {
    return (original: IWorkspaceCatalogFactory) => new WithCatalogCaching(original, ctx);
}

function cachedSecuritySettings(ctx: CachingContext): SecuritySettingsDecoratorFactory {
    return (original: ISecuritySettingsService) => new WithSecuritySettingsCaching(original, ctx);
}

function cachingEnabled(desiredSize: number | undefined): boolean {
    return desiredSize !== undefined && desiredSize > 0;
}

function cacheControl(ctx: CachingContext): CacheControl {
    const control = {
        resetExecutions: () => {
            ctx.caches.execution?.reset();
        },

        resetCatalogs: () => {
            ctx.caches.workspaceCatalogs?.reset();
        },

        resetSecuritySettings: () => {
            ctx.caches.securitySettings?.reset();
        },

        resetAll: () => {
            control.resetExecutions();
            control.resetCatalogs();
            control.resetSecuritySettings();
        },
    };

    return control;
}

//
// Public interface
//

/**
 * Cache control can be used to interact with the caching layer - at the moment to reset the contents of the
 * different top-level caches.
 *
 * @beta
 */
export type CacheControl = {
    /**
     * Resets all execution caches.
     *
     * NOTE: this only resets the top-level caches. If your code holds onto execution results returned by
     * caching backend, those have additional sub-caches which _will not_ be impacted by this call.
     */
    resetExecutions: () => void;

    /**
     * Resets all catalog caches.
     */
    resetCatalogs: () => void;

    /**
     * Resets all organization security settings caches.
     */
    resetSecuritySettings: () => void;

    /**
     * Convenience method to reset all caches (calls all the particular resets).
     */
    resetAll: () => void;
};

/**
 * Specifies where should the caching decorator apply and to what size should caches grow.
 *
 * @beta
 */
export type CachingConfiguration = {
    /**
     * Maximum number of executions which will have their results cached. The execution fingerprint is used
     * as cache key - the caching is thus subject to some limitations. See `defFingerprint` function for more
     * information.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * executions cache is dangerous in applications with long-lived sessions that can create many unique executions -
     * memory usage will only go up.
     *
     * When non-positive number is specified, then no caching will be done.
     */
    maxExecutions: number | undefined;

    /**
     * Maximum number of execution result's pages to cache PER result. The window offset and limit are used as cache key.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * result window cache is dangerous in applications that read result windows in 'random' fashion.
     *
     * When non-positive number is specified, then no caching of result windows will be done.
     *
     * Note: this option has no effect if execution caching is disabled.
     */
    maxResultWindows: number | undefined;

    /**
     * Maximum number of workspaces for which to cache catalogs. The workspace identifier is used as cache key. For
     * each workspace, there will be a cache entry holding `maxCatalogOptions` entries.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * catalogs cache may be OK in applications where number of workspaces is small - the cache will be limited
     * naturally and will not grow uncontrollably.
     *
     * When non-positive number is specified, then no caching of result windows will be done.
     */
    maxCatalogs: number | undefined;

    /**
     * Catalog can be viewed in many different ways - determined by the options specified during load. This option
     * indicates how many unique options to cache results for.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. How dangerous
     * this is depends on how many catalog load options combinations your application allows to create. Recommended
     * approach is to load entire catalog of all items once and reuse it. If there is chance that your app can create
     * many unique options, then it is better to bound this.
     *
     * Setting non-positive number here is invalid. If you want to turn off catalog caching, tweak the `maxCatalogs`.
     */
    maxCatalogOptions: number | undefined;

    /**
     * Optionally specify function to call once the caching is set up. If present, the function will be called
     * with an instance of {@link CacheControl} which you can use to interact with the caches.
     *
     * @param cacheControl - cache control instance
     */
    onCacheReady?: (cacheControl: CacheControl) => void;

    /**
     * Maximum number of organizations that will have its security settings cached. The scope string built by
     * particular backend implementation from organization ID will be used as cache key.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * security settings organization cache is dangerous in applications with long-lived sessions that can
     * create many unique requests and memory usage will only go up.
     *
     * When non-positive number is specified, then no caching will be done.
     */
    maxSecuritySettingsOrgs: number | undefined;

    /**
     * Maximum number of URLs per organization that will have its validation result cached. The URL
     * and validation context is used to form a cache key.
     *
     * When limit is reached, cache entries will be evicted using LRU policy.
     *
     * When no maximum number is specified, the cache will be unbounded and no evictions will happen. Unbounded
     * security settings organization URL cache is dangerous in applications with long-lived sessions that can
     * create many unique requests and memory usage will only go up.
     *
     * Setting non-positive number here is invalid. If you want to turn off organization security settings caching,
     * tweak the `maxSecuritySettingsOrgs`.
     */
    maxSecuritySettingsOrgUrls: number | undefined;

    /**
     * Maximum age of cached organization's URL validation results. The value is in milliseconds.
     *
     * Items are not pro-actively pruned out as they age, but if you try to get an item that is too old,
     * it'll drop it and make a new request to the backend. The purpose of the cache setting is not mainly
     * to limit its size to prevent memory usage grow (tweak `maxSecuritySettingsOrgUrls` for that)
     * but to propagate URL whitelist changes on backend to the long-lived application sessions.
     *
     * Setting non-positive number here is invalid. If you want to turn off organization security settings
     * caching, tweak the `maxSecuritySettingsOrgs`.
     */
    maxSecuritySettingsOrgUrlsAge: number | undefined;
};

function assertPositiveOrUndefined(value: number | undefined, valueName: string) {
    invariant(
        value === undefined || value > 0,
        `${valueName} to cache must be positive or undefined, got: ${value}`,
    );
}

/**
 * @beta
 */
export const DefaultCachingConfiguration: CachingConfiguration = {
    maxExecutions: 10,
    maxResultWindows: 5,
    maxCatalogs: 1,
    maxCatalogOptions: 50,
    maxSecuritySettingsOrgs: 3,
    maxSecuritySettingsOrgUrls: 100,
    maxSecuritySettingsOrgUrlsAge: 300_000, // 5 minutes
};

/**
 * Adds caching layer on top of an existing analytical backend instance. It is currently possible to cache
 * results of executions and the workspace LDM catalog.
 *
 * @remarks see {@link CachingConfiguration} properties for more information.
 * @param realBackend - real backend to decorate with caching
 * @param config - caching configuration
 * @beta
 */
export function withCaching(
    realBackend: IAnalyticalBackend,
    config: CachingConfiguration = DefaultCachingConfiguration,
): IAnalyticalBackend {
    assertPositiveOrUndefined(config.maxCatalogOptions, "maxCatalogOptions");
    assertPositiveOrUndefined(config.maxSecuritySettingsOrgUrls, "maxSecuritySettingsOrgUrls");
    assertPositiveOrUndefined(config.maxSecuritySettingsOrgUrlsAge, "maxSecuritySettingsOrgUrlsAge");

    const execCaching = cachingEnabled(config.maxExecutions);
    const catalogCaching = cachingEnabled(config.maxCatalogs);
    const securitySettingsCaching = cachingEnabled(config.maxSecuritySettingsOrgs);

    const ctx: CachingContext = {
        caches: {
            execution: execCaching ? new LRUCache({ max: config.maxExecutions }) : undefined,
            workspaceCatalogs: catalogCaching ? new LRUCache({ max: config.maxCatalogs }) : undefined,
            securitySettings: securitySettingsCaching
                ? new LRUCache({ max: config.maxSecuritySettingsOrgs })
                : undefined,
        },
        config,
    };

    const execution = execCaching ? cachedExecutions(ctx) : identity;
    const catalog = catalogCaching ? cachedCatalog(ctx) : identity;
    const securitySettings = securitySettingsCaching ? cachedSecuritySettings(ctx) : identity;

    if (config.onCacheReady) {
        config.onCacheReady(cacheControl(ctx));
    }

    return decoratedBackend(realBackend, { execution, catalog, securitySettings });
}
