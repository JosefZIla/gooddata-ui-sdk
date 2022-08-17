// (C) 2007-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";
import { InvertableSelectLimitWarning } from "./InvertableSelectLimitWarning";

/**
 * @internal
 */
export interface IInvertableSelectStatusBarProps<T> {
    className?: string;
    isInverted: boolean;
    selectedItems: T[];
    getItemTitle: (item: T) => string;
    selectedItemsLimit: number;
}

/**
 * @internal
 */
export function InvertableSelectStatusBar<T>(props: IInvertableSelectStatusBarProps<T>) {
    const { className, selectedItems, getItemTitle, isInverted, selectedItemsLimit } = props;

    const intl = useIntl();

    const isSelectionEmpty = selectedItems.length === 0;
    const isAll = isSelectionEmpty && isInverted;
    const isNone = isSelectionEmpty && !isInverted;
    const isAllExcept = !isSelectionEmpty && isInverted;

    const selectionString = useMemo(() => {
        return selectedItems.map((selectedItem) => getItemTitle(selectedItem)).join(", ");
    }, [selectedItems, getItemTitle]);

    return (
        <>
            <div className={cx(["gd-list-status-bar", "s-list-status-bar", className])}>
                <span>&nbsp;{intl.formatMessage({ id: "gs.list.is" })}&nbsp;</span>
                {isAll && <b>{intl.formatMessage({ id: "gs.list.all" })}</b>}
                {isNone && <b>{intl.formatMessage({ id: "gs.filterLabel.none" })}</b>}
                {isAllExcept && (
                    <span>
                        <b>{intl.formatMessage({ id: "gs.list.all" })}</b>&nbsp;
                        {intl.formatMessage({ id: "gs.list.except" })}&nbsp;
                    </span>
                )}
                {!isAll && !isSelectionEmpty && (
                    <>
                        <span
                            className="gd-shortened-text gd-selection-list s-dropdown-attribute-selection-list"
                            title={selectionString}
                        >
                            {selectionString}
                        </span>
                        {`\xa0(${selectedItems.length})`}
                    </>
                )}
            </div>
            {selectedItems.length >= selectedItemsLimit && (
                <InvertableSelectLimitWarning
                    limit={selectedItemsLimit}
                    selectedItemsCount={selectedItems.length}
                />
            )}
        </>
    );
}