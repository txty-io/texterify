import { CheckOutlined, RobotOutlined } from "@ant-design/icons";
import { Alert, Button, message, Skeleton } from "antd";
import DeeplLogo from "images/deepl_logo.svg";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { IGetLanguagesResponse, ILanguage } from "../api/v1/LanguagesAPI";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages,
    IGetMachineTranslationSuggestion,
    MachineTranslationsAPI
} from "../api/v1/MachineTranslationsAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { MachineTranslationUtils } from "../utilities/MachineTranslationUtils";
import { TranslationUtils } from "../utilities/TranslationUtils";
import { FeatureNotAvailable } from "./FeatureNotAvailable";

export function MachineTranslationSuggestion(props: {
    languagesResponse: IGetLanguagesResponse;
    defaultLanguage: ILanguage;
    defaultLanguageTranslationContent: string;
    keyReponse: any;
    selectedLanguageId: string;
    translationForTargetLanguage: string;
    supportedSourceLanguages: IGetMachineTranslationsSourceLanguages;
    supportedTargetLanguages: IGetMachineTranslationsTargetLanguages;
    isHTMLKey: boolean;
    projectId: string;
    onUseTranslation(data: { suggestion: IGetMachineTranslationSuggestion }): void;
}) {
    const [machineTranslationLimitExceeded, setMachineTranslationLimitExceeded] = React.useState<boolean>(false);
    const [translationSuggestionLoading, setTranslationSuggestionLoading] = React.useState<boolean>(false);
    const [translationSuggestion, setTranslationSuggestion] = React.useState<IGetMachineTranslationSuggestion>(null);

    function defaultLanguageSupportsMachineTranslation() {
        return MachineTranslationUtils.supportsMachineTranslationAsSourceLanguage({
            language: props.defaultLanguage,
            languagesResponse: props.languagesResponse,
            supportedSourceLanguages: props.supportedSourceLanguages
        });
    }

    function languageSupportsMachineTranslation(languageId: string) {
        const language = props.languagesResponse.data.find((l) => {
            return l.id === languageId;
        });

        const languageLanguageCode = APIUtils.getIncludedObject(
            language.relationships.language_code.data,
            props.languagesResponse.included
        );

        return props.supportedTargetLanguages?.data.some((supportedTargetLanguage) => {
            return supportedTargetLanguage.attributes.language_code === languageLanguageCode.attributes.code;
        });
    }

    function machineTranslationsSupported(languageId: string) {
        return defaultLanguageSupportsMachineTranslation() && languageSupportsMachineTranslation(languageId);
    }

    React.useEffect(() => {
        if (!props.defaultLanguage) {
            return;
        }

        const defaultLanguageTranslation = TranslationUtils.getTranslationForLanguage({
            keyResponse: props.keyReponse,
            languageId: props.defaultLanguage.id
        });

        if (!defaultLanguageTranslation) {
            return;
        }

        (async () => {
            setMachineTranslationLimitExceeded(false);

            if (dashboardStore.currentProject.attributes.machine_translation_active) {
                if (props.isHTMLKey || !machineTranslationsSupported(props.selectedLanguageId)) {
                    // Machine translations for HTML keys are not supported.
                    return;
                }

                if (props.defaultLanguage && props.defaultLanguageTranslationContent) {
                    setTranslationSuggestionLoading(true);

                    try {
                        const suggestion = await MachineTranslationsAPI.machineTranslationSuggestion({
                            projectId: props.projectId,
                            translationId: defaultLanguageTranslation.id,
                            targetLanguageId: props.selectedLanguageId
                        });

                        setTranslationSuggestion(suggestion);
                    } catch (error) {
                        console.error(error);

                        if (error.message === "MACHINE_TRANSLATIONS_USAGE_EXCEEDED") {
                            setMachineTranslationLimitExceeded(true);
                        } else {
                            message.error("Failed to load machine translation.");
                        }
                    }

                    setTranslationSuggestionLoading(false);
                }
            }
        })();
    }, [
        props.defaultLanguage,
        props.defaultLanguageTranslationContent,
        props.selectedLanguageId,
        props.defaultLanguageTranslationContent
    ]);

    return (
        <>
            {props.defaultLanguage && !props.isHTMLKey && (
                <div style={{ padding: 8, marginTop: 8 }}>
                    <h4 style={{ fontSize: 12 }}>
                        <RobotOutlined style={{ marginRight: 4 }} /> Machine Translation Suggestion
                    </h4>
                    {(translationSuggestionLoading ||
                        !props.supportedSourceLanguages ||
                        !props.supportedTargetLanguages) && (
                        <div style={{ marginTop: 16, marginBottom: 16 }}>
                            <Skeleton active paragraph={{ rows: 2 }} title={false} />
                        </div>
                    )}

                    {!dashboardStore.currentProject.attributes.machine_translation_active && (
                        <Alert showIcon type="warning" message="Machine translation is not enabled." />
                    )}

                    {dashboardStore.currentProject.attributes.machine_translation_active &&
                        props.supportedSourceLanguages &&
                        props.supportedTargetLanguages &&
                        !machineTranslationsSupported(props.selectedLanguageId) && (
                            <Alert
                                showIcon
                                type="info"
                                message={
                                    <>
                                        {!defaultLanguageSupportsMachineTranslation() && (
                                            <div>
                                                Machine translation with your default language as source is not
                                                supported.
                                            </div>
                                        )}
                                        {!languageSupportsMachineTranslation(props.selectedLanguageId) && (
                                            <div>Machine translation to the selected language is not supported.</div>
                                        )}
                                    </>
                                }
                            />
                        )}

                    {!dashboardStore.featureEnabled("FEATURE_MACHINE_TRANSLATION_SUGGESTIONS") && (
                        <FeatureNotAvailable feature="FEATURE_MACHINE_TRANSLATION_SUGGESTIONS" />
                    )}

                    {machineTranslationLimitExceeded && (
                        <Alert showIcon type="error" message="You have exceeded your machine translation limit." />
                    )}

                    {dashboardStore.currentProject.attributes.machine_translation_active &&
                        dashboardStore.featureEnabled("FEATURE_MACHINE_TRANSLATION_SUGGESTIONS") &&
                        !translationSuggestionLoading &&
                        props.supportedSourceLanguages &&
                        props.supportedTargetLanguages &&
                        !machineTranslationLimitExceeded &&
                        defaultLanguageSupportsMachineTranslation() &&
                        languageSupportsMachineTranslation(props.selectedLanguageId) && (
                            <div>
                                {props.defaultLanguageTranslationContent && translationSuggestion ? (
                                    translationSuggestion.translation !== props.translationForTargetLanguage ? (
                                        <>
                                            <div style={{ marginTop: 16 }}>{translationSuggestion.translation}</div>
                                            <Button
                                                type="primary"
                                                style={{ marginTop: 16, marginBottom: 8 }}
                                                onClick={() => {
                                                    props.onUseTranslation({
                                                        suggestion: translationSuggestion
                                                    });
                                                }}
                                            >
                                                Use translation
                                            </Button>
                                        </>
                                    ) : (
                                        <div
                                            style={{
                                                fontStyle: "italic",
                                                color: "var(--color-passive)",
                                                fontSize: 12,
                                                marginTop: 16,
                                                marginBottom: 16
                                            }}
                                        >
                                            <CheckOutlined style={{ color: "var(--color-success)", marginRight: 4 }} />{" "}
                                            Machine translation suggestion is the same as the current translation.
                                            <div style={{ fontWeight: "bold", marginTop: 16 }}>
                                                {translationSuggestion.translation}
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <div
                                        style={{
                                            fontStyle: "italic",
                                            color: "var(--color-passive)",
                                            fontSize: 12,
                                            marginTop: 16,
                                            marginBottom: 16
                                        }}
                                    >
                                        No translation in source language to translate.
                                    </div>
                                )}
                            </div>
                        )}
                    <div
                        style={{
                            color: "var(--color-passive)",
                            marginTop: 8,
                            fontSize: 11,
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        powered by <img src={DeeplLogo} style={{ maxWidth: 16, marginRight: 4, marginLeft: 4 }} />
                        DeepL
                    </div>
                </div>
            )}
        </>
    );
}
