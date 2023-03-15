// (C) 2022-2023 GoodData Corporation

export type {
    IReactOptions,
    IWebComponentsOptions,
    EmbedType,
    EmbedOptionsType,
    InsightCodeType,
    CodeLanguageType,
    UnitsType,
    CopyCodeOriginType,
} from "./EmbedInsightDialogBase/types";

export { getDefaultEmbedTypeOptions, getHeightWithUnitsForEmbedCode } from "./utils";

export { EmbedInsightDialogBase } from "./EmbedInsightDialogBase/EmbedInsightDialogBase";
export type { IEmbedInsightDialogBaseProps } from "./EmbedInsightDialogBase/EmbedInsightDialogBase";

export { NumericInput } from "./EmbedInsightDialogBase/components/NumericInput";
export type { INumericInputProps } from "./EmbedInsightDialogBase/components/NumericInput";

export { CodeArea } from "./EmbedInsightDialogBase/components/CodeArea";
export type { ICodeAreaProps } from "./EmbedInsightDialogBase/components/CodeArea";

export { CodeLanguageSelect } from "./EmbedInsightDialogBase/components/CodeLanguageSelect";
export type { ICodeLanguageSelectProps } from "./EmbedInsightDialogBase/components/CodeLanguageSelect";

export { CodeOptions } from "./EmbedInsightDialogBase/components/CodeOptions";
export type { ICodeOptionsProps } from "./EmbedInsightDialogBase/components/CodeOptions";

export { LocaleSetting } from "./EmbedInsightDialogBase/components/LocaleSetting";
export type { ILocaleSettingProps } from "./EmbedInsightDialogBase/components/LocaleSetting";
