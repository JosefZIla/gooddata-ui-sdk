// (C) 2007-2020 GoodData Corporation
import React, { PureComponent, ReactNode } from "react";
import { injectIntl, FormattedMessage, WrappedComponentProps } from "react-intl";
import uniqueId from "lodash/uniqueId";
import identity from "lodash/identity";
import cx from "classnames";

import { IHeaderMenuProps, IHeaderMenuItem } from "./typings";

class WrappedHeaderMenu extends PureComponent<IHeaderMenuProps & WrappedComponentProps> {
    static defaultProps: Partial<IHeaderMenuProps & WrappedComponentProps> = {
        className: "",
        onMenuItemClick: identity,
        sections: [],
    };

    getClassNames(): string {
        return cx("gd-header-menu", this.props.className);
    }

    renderSection(items: IHeaderMenuItem[]): ReactNode {
        return items.map((item) => {
            const clickHandler = item.onClick
                ? item.onClick
                : (event: React.MouseEvent) => this.props.onMenuItemClick(item, event);

            const classNames = cx("gd-header-menu-item", {
                active: item.isActive,
            });

            return (
                <li key={item.key}>
                    <a
                        onClick={clickHandler} // eslint-disable-line react/jsx-no-bind
                        href={item.href}
                        className={classNames}
                        target={item.target}
                        rel={item.target === "_blank" ? "noreferrer noopener" : undefined}
                    >
                        <span className={item.className}>
                            <FormattedMessage id={item.key} />
                        </span>
                    </a>
                </li>
            );
        });
    }

    renderSections(): ReactNode {
        return this.props.sections.map((items) => {
            return (
                <ul key={uniqueId("section-")} className="gd-header-menu-section gd-header-measure">
                    {this.renderSection(items)}
                </ul>
            );
        });
    }

    render(): ReactNode {
        return <div className={this.getClassNames()}>{this.renderSections()}</div>;
    }
}

export const HeaderMenu = injectIntl(WrappedHeaderMenu);
