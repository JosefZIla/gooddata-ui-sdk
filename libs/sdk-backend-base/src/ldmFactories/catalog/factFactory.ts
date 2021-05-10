// (C) 2019-2021 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "@gooddata/sdk-model";
import { ICatalogFact, IFactMetadataObject, isFactMetadataObject } from "@gooddata/sdk-backend-spi";
import { GroupableCatalogItemBuilder } from "./groupFactory";
import { builderFactory, BuilderModifications } from "../builder";
import { FactMetadataObjectBuilder, newFactMetadataObject } from "../metadata/factFactory";

/**
 * Catalog fact builder
 * See {@link Builder}
 *
 * @beta
 */
export class CatalogFactBuilder<
    T extends ICatalogFact = ICatalogFact,
> extends GroupableCatalogItemBuilder<T> {
    public fact(
        factOrRef: IFactMetadataObject | ObjRef,
        modifications?: BuilderModifications<FactMetadataObjectBuilder>,
    ): this {
        if (!isFactMetadataObject(factOrRef)) {
            this.item.fact = newFactMetadataObject(factOrRef, modifications);
        } else {
            this.item.fact = factOrRef;
        }
        return this;
    }
}

/**
 * Catalog fact factory
 *
 * @param modifications - catalog fact builder modifications to perform
 * @returns created catalog fact
 * @beta
 */
export const newCatalogFact = (
    modifications: BuilderModifications<CatalogFactBuilder> = identity,
): ICatalogFact => builderFactory(CatalogFactBuilder, { type: "fact" }, modifications);
