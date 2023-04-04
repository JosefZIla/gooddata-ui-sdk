// (C) 2021-2023 GoodData Corporation
import { useCallback, useMemo } from "react";
import { IAttributeFilter, idRef, newNegativeAttributeFilter } from "@gooddata/sdk-model";
import { IPlaceholder, usePlaceholder } from "@gooddata/sdk-ui";

/**
 * @internal
 */
export const useResolveFilterInput = (
    filter?: IAttributeFilter,
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>,
    identifier?: string,
) => {
    const [resolvedPlaceholder, setPlaceholderValue] = usePlaceholder(connectToPlaceholder);

    const currentFilter = useMemo(() => {
        return resolvedPlaceholder ?? filter ?? createFilterFromIdentifier(identifier);
    }, [resolvedPlaceholder, filter, identifier]);

    const setConnectedPlaceholderValue = useCallback(
        (filter: IAttributeFilter) => {
            if (connectToPlaceholder) {
                setPlaceholderValue(filter);
            }
        },
        [connectToPlaceholder, setPlaceholderValue],
    );

    return {
        filter: currentFilter,
        setConnectedPlaceholderValue,
    };
};

const createFilterFromIdentifier = (identifier: string) => {
    return newNegativeAttributeFilter(idRef(identifier), {
        uris: [],
    });
};
