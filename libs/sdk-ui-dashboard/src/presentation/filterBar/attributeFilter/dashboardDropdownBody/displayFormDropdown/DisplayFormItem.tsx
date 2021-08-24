// (C) 2021 GoodData Corporation

import React from "react";
import classNames from "classnames";
import { stringUtils } from "@gooddata/util";
import { ObjRef } from "@gooddata/sdk-model";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { IAttributeDisplayFormMetadataObject } from "@gooddata/sdk-backend-spi";

type AttributeDisplayFormType = "GDC.link" | "GDC.geo.pin";

const getDisplayFormIcon = (type?: AttributeDisplayFormType) => {
    switch (type) {
        case "GDC.link":
            return "gd-icon-hyperlink-warning";
        case "GDC.geo.pin":
            return "gd-icon-earth";
        default:
            return "gd-icon-label-warning";
    }
};

const tooltipAlignPoints = [
    { align: "cl cr", offset: { x: -10, y: 0 } },
    { align: "cr cl", offset: { x: 10, y: 0 } },
];

export interface IDisplayFormDropdownItemProps {
    displayForm: IAttributeDisplayFormMetadataObject;
    onClick: (displayForm: ObjRef) => void;
    selected: boolean;
}

export const DisplayDropdownItem: React.FC<IDisplayFormDropdownItemProps> = ({
    displayForm,
    selected,
    onClick,
}) => {
    const { title } = displayForm;

    const className = classNames(
        "gd-list-item",
        "attribute-display-form-name",
        "s-attribute-display-form-name",
        `s-attribute-display-form-name-${stringUtils.simplifyText(title)}`,
        getDisplayFormIcon(displayForm.displayFormType as AttributeDisplayFormType),
        {
            "is-selected": selected,
        },
    );

    const handleOnClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onClick(displayForm.ref);
        e.preventDefault();
    };

    return (
        <div className={className} onClick={handleOnClick}>
            <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{title}</ShortenedText>
        </div>
    );
};
