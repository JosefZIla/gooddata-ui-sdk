// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";

import { IMessageProps } from "./typings";

/**
 * @internal
 */
export const Message: React.FC<IMessageProps> = ({
    onClose,
    type,
    children,
    className,
    contrast,
    intensive,
}) => {
    const classes = cx("gd-message", "s-message", className, {
        success: type === "success",
        progress: type === "progress",
        error: type === "error",
        warning: type === "warning",
        contrast,
        intensive,
    });

    return (
        <div className={classes}>
            <div className="gd-message-text">
                {children}
                {onClose && (
                    <div className="gd-message-dismiss-container">
                        <a className="gd-message-dismiss gd-icon-cross" onClick={onClose} />
                    </div>
                )}
            </div>
        </div>
    );
};
