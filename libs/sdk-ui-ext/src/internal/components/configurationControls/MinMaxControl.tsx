// (C) 2019 GoodData Corporation
import React from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { Message } from "@gooddata/sdk-ui-kit";

import ConfigSubsection from "../configurationControls/ConfigSubsection";
import InputControl from "../configurationControls/InputControl";

import { IMinMaxControlProps, IMinMaxControlState } from "../../interfaces/MinMaxControl";
import { minInputValidateAndPushData, maxInputValidateAndPushData } from "../../utils/controlsHelper";

const defaultMinMaxControlState = {
    minScale: {
        hasWarning: false,
        warningMessage: "",
        incorrectValue: "",
    },
    maxScale: {
        hasWarning: false,
        warningMessage: "",
        incorrectValue: "",
    },
};

class MinMaxControl extends React.Component<
    IMinMaxControlProps & WrappedComponentProps,
    IMinMaxControlState
> {
    public static getDerivedStateFromProps(props: IMinMaxControlProps & WrappedComponentProps) {
        if (props.propertiesMeta?.undoApplied) {
            return defaultMinMaxControlState;
        }

        return null;
    }

    constructor(props: IMinMaxControlProps & WrappedComponentProps) {
        super(props);
        this.state = defaultMinMaxControlState;
    }

    public render() {
        return this.renderMinMaxSection();
    }

    private renderMinMaxSection() {
        const { properties, basePath, isDisabled } = this.props;

        const basePathPropertiesControls = properties?.controls?.[basePath];
        const axisScaleMin = basePathPropertiesControls?.min ?? "";
        const axisScaleMax = basePathPropertiesControls?.max ?? "";
        const axisVisible = basePathPropertiesControls?.visible ?? true;

        return (
            <ConfigSubsection title="properties.axis.scale">
                <InputControl
                    valuePath={`${basePath}.min`}
                    labelText="properties.axis.min"
                    placeholder="properties.auto_placeholder"
                    type="number"
                    hasWarning={this.minScaleHasWarning()}
                    value={
                        this.minScaleHasIncorrectValue() ? this.state.minScale?.incorrectValue : axisScaleMin
                    }
                    disabled={isDisabled || !axisVisible}
                    properties={properties}
                    pushData={this.minInputValidateAndPushDataCallback}
                />
                {this.renderMinErrorMessage()}

                <InputControl
                    valuePath={`${basePath}.max`}
                    labelText="properties.axis.max"
                    placeholder="properties.auto_placeholder"
                    type="number"
                    hasWarning={this.maxScaleHasWarning()}
                    value={
                        this.maxScaleHasIncorrectValue() ? this.state.maxScale?.incorrectValue : axisScaleMax
                    }
                    disabled={isDisabled || !axisVisible}
                    properties={properties}
                    pushData={this.maxInputValidateAndPushDataCallback}
                />
                {this.renderMaxErrorMessage()}
            </ConfigSubsection>
        );
    }

    private minInputValidateAndPushDataCallback = (data: any): void => {
        minInputValidateAndPushData(
            data,
            this.state,
            this.props,
            this.setState.bind(this),
            defaultMinMaxControlState,
        );
    };

    private maxInputValidateAndPushDataCallback = (data: any): void => {
        maxInputValidateAndPushData(
            data,
            this.state,
            this.props,
            this.setState.bind(this),
            defaultMinMaxControlState,
        );
    };

    private minScaleHasIncorrectValue() {
        return (this.state.minScale?.incorrectValue ?? "") !== "";
    }

    private maxScaleHasIncorrectValue() {
        return (this.state.maxScale?.incorrectValue ?? "") !== "";
    }

    private minScaleHasWarning() {
        return this.state.minScale?.hasWarning ?? false;
    }

    private maxScaleHasWarning() {
        return this.state.maxScale?.hasWarning ?? false;
    }

    private renderMinErrorMessage() {
        const minScaleWarningMessage = this.state.minScale?.warningMessage ?? "";
        if (!this.minScaleHasWarning() || minScaleWarningMessage === "") {
            return false;
        }

        return (
            <Message type="warning" className="adi-input-warning">
                {minScaleWarningMessage}
            </Message>
        );
    }

    private renderMaxErrorMessage() {
        const maxScaleWarningMessage = this.state.maxScale?.warningMessage ?? "";
        if (!this.maxScaleHasWarning() || maxScaleWarningMessage === "") {
            return false;
        }

        return (
            <Message type="warning" className="adi-input-warning">
                {maxScaleWarningMessage}
            </Message>
        );
    }
}

export default injectIntl(MinMaxControl);
