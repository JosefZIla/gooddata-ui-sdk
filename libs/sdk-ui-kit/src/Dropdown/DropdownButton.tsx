// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Button } from "../Button/Button";

/**
 * @internal
 */
export interface IDropdownButtonProps {
    className?: string;

    value?: string;
    title?: string;
    disabled?: boolean;

    isOpen?: boolean;
    isSmall?: boolean;
    iconLeft?: string;

    onClick?: (e: React.MouseEvent) => void;
}

/**
 * @internal
 */
export const DropdownButton: React.FC<IDropdownButtonProps> = ({
    className,

    value,
    title = value,
    disabled,

    isOpen,
    isSmall = true,
    iconLeft,

    onClick,
}) => {
    const buttonClasses = cx(
        "gd-button-primary",
        "button-dropdown",
        "dropdown-button",
        {
            "gd-button-small": isSmall,
            "is-dropdown-open": isOpen,
            "is-active": isOpen,
        },
        className,
    );

    return (
        <Button
            title={title}
            className={buttonClasses}
            value={value}
            iconLeft={iconLeft}
            iconRight={isOpen ? "gd-icon-navigateup" : "gd-icon-navigatedown"}
            disabled={disabled}
            onClick={onClick}
        />
    );
};
