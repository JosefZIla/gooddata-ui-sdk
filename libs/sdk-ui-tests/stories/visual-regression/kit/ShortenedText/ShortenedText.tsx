// (C) 2007-2020 GoodData Corporation
import React from "react";
import { ShortenedText } from "@gooddata/sdk-ui-kit";
import { storiesOf } from "@storybook/react";
import { UiKit } from "../../../_infra/storyGroups";
import { wrapWithTheme } from "../../themeWrapper";
import { withScreenshot } from "../../../_infra/backstopWrapper";

import "./ShortenedText.css";

const ShortenedTextExamples: React.FC = () => {
    return (
        <div className="screenshot-target shortened-text-wrapper">
            <div style={{ width: 150 }}>
                <ShortenedText
                    className="example-long-text"
                    tooltipAlignPoints={[{ align: "bc tc", offset: { x: 0, y: 0 } }]}
                >
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua.
                </ShortenedText>
            </div>

            <p>Shortened text which fits into its container is not shortened</p>

            <div className="example-wrapper-large">
                <ShortenedText>test</ShortenedText>
            </div>

            <p>
                Shortened text can be configured to use custom <code>tagName</code> and{" "}
                <code>classNames</code>
            </p>
            <div className="example-wrapper-large">
                <ShortenedText tagName="div" className="foo">
                    test
                </ShortenedText>
            </div>

            <p>Shortened text with shortening when it does not fit into its container</p>
            <div className="example-wrapper-small">
                <ShortenedText className="example-long-text">very long text and more and more</ShortenedText>
            </div>

            <p>
                Shortened text with shortening and provided custom align points via{" "}
                <code>tooltipAlignPoints</code>
            </p>
            <div className="example-wrapper-small">
                <ShortenedText
                    className="example-long-text"
                    tooltipAlignPoints={[{ align: "bc tc", offset: { x: 0, y: 0 } }]}
                >
                    very long text and more and more
                </ShortenedText>
            </div>
        </div>
    );
};

storiesOf(`${UiKit}/ShortenedText`, module).add("full-featured", () =>
    withScreenshot(<ShortenedTextExamples />),
);
storiesOf(`${UiKit}/ShortenedText`, module).add("themed", () =>
    withScreenshot(wrapWithTheme(<ShortenedTextExamples />)),
);
