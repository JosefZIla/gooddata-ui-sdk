// (C) 2019-2020 GoodData Corporation
import identity from "lodash/identity";
import { ObjRef } from "@gooddata/sdk-model";
import { MetadataObjectBuilder } from "./factory";
import { IFactMetadataObject } from "@gooddata/sdk-backend-spi";
import { builderFactory, BuilderModifications } from "../builder";

/**
 * Fact metadata object builder
 * See {@link Builder}
 *
 * @beta
 */
export class FactMetadataObjectBuilder<
    T extends IFactMetadataObject = IFactMetadataObject,
> extends MetadataObjectBuilder<T> {}

/**
 * Fact metadata object factory
 *
 * @param ref - fact reference
 * @param modifications - fact builder modifications to perform
 * @returns created fact metadata object
 * @beta
 */
export const newFactMetadataObject = (
    ref: ObjRef,
    modifications: BuilderModifications<FactMetadataObjectBuilder> = identity,
): IFactMetadataObject => builderFactory(FactMetadataObjectBuilder, { type: "fact", ref }, modifications);
