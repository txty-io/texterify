import { CheckOutlined, CloseCircleOutlined } from "@ant-design/icons";
import * as React from "react";
import { IGetLanguagesResponse, ILanguage } from "../api/v1/LanguagesAPI";
import { IGetMachineTranslationsSourceLanguages } from "../api/v1/MachineTranslationsAPI";
import { MachineTranslationUtils } from "../utilities/MachineTranslationUtils";

export function MachineTranslationSourceSupportMessage(props: {
    defaultLanguage: ILanguage;
    languagesResponse: IGetLanguagesResponse;
    supportedSourceLanguages: IGetMachineTranslationsSourceLanguages;
}) {
    const isSupported = MachineTranslationUtils.supportsMachineTranslationAsSourceLanguage({
        language: props.defaultLanguage,
        languagesResponse: props.languagesResponse,
        supportedSourceLanguages: props.supportedSourceLanguages
    });

    return isSupported ? (
        <span
            style={{
                display: "inline-block",
                marginLeft: 56,
                fontStyle: "italic",
                color: "var(--color-passive)",
                fontSize: 12
            }}
        >
            <CheckOutlined style={{ color: "var(--color-success)", marginRight: 8 }} />
            Default language supports machine translation.
        </span>
    ) : (
        <span
            style={{
                display: "inline-block",
                marginLeft: 56,
                fontStyle: "italic",
                color: "var(--color-passive)",
                fontSize: 12
            }}
        >
            <CloseCircleOutlined style={{ color: "var(--color-error)", marginRight: 8 }} />
            Default language does not support machine translation.
        </span>
    );
}
