import { Form, FormInstance, message } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import { IGetKeyResponse } from "../api/v1/KeysAPI";
import { IGetLanguagesResponse } from "../api/v1/LanguagesAPI";
import { ITranslation, TranslationsAPI } from "../api/v1/TranslationsAPI";
import { HTMLEditor } from "../sites/dashboard/editor/HTMLEditor";
import { ErrorUtils } from "../ui/ErrorUtils";
import { Loading } from "../ui/Loading";
import { TranslationUtils } from "../utilities/TranslationUtils";

function PluralFormHeading(props: { name: string }) {
    return <div style={{ fontWeight: "bold" }}>{props.name}</div>;
}

export interface IEditTranslationFormProps {
    projectId: string;
    languagesResponse: IGetLanguagesResponse;
    keyResponse?: IGetKeyResponse;
    selectedLanguageId: string;
    selectedExportConfigId: string | null;
    forceHTML?: boolean;
    forcePluralization?: boolean;
    forceContentOther?: string;
    formId?: string;
    clearFieldsAfterSubmit?: boolean;
    style?: React.CSSProperties;
    onChange?(values: IEditTranslationFormFormValues): void;
    onSuccess?(values: IEditTranslationFormFormValues): void;
}

export interface IEditTranslationFormFormValues {
    other: string;
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
}

export function EditTranslationForm(props: IEditTranslationFormProps) {
    const [translation, setTranslation] = React.useState<ITranslation | null>(null);
    const [translationLoading, setTranslationLoading] = React.useState<boolean>(true);

    const [form] = Form.useForm();

    // Set the correct translation if language or export target changes.
    React.useEffect(() => {
        if (props.selectedLanguageId && props.keyResponse) {
            setTranslationLoading(true);

            try {
                const translationForLanguage = TranslationUtils.getTranslationForLanguage({
                    languageId: props.selectedLanguageId,
                    keyResponse: props.keyResponse,
                    exportConfigId: props.selectedExportConfigId
                });

                setTranslation(translationForLanguage);
            } catch (error) {
                console.error(error);
                ErrorUtils.showError("Failed to load translation");
            }
        }

        setTranslationLoading(false);
    }, [
        props.projectId,
        props.keyResponse,
        props.selectedLanguageId,
        props.selectedExportConfigId,
        props.languagesResponse
    ]);

    React.useEffect(() => {
        if (props.forceContentOther) {
            form.setFieldsValue({
                other: props.forceContentOther
            });

            // Call onChange here because onValuesChange is not triggered if
            // setting the form values explicitly.
            if (props.onChange) {
                props.onChange({
                    other: props.forceContentOther
                });
            }
        }
    }, [props.forceContentOther]);

    // If the selected translation changes set the form fields accordingly.
    React.useEffect(() => {
        form.setFieldsValue({
            zero: translation?.attributes.zero,
            one: translation?.attributes.one,
            two: translation?.attributes.two,
            few: translation?.attributes.few,
            many: translation?.attributes.many,
            other: translation?.attributes.content
        });
    }, [translation]);

    const selectedLanguage = props.languagesResponse.data.find((language) => {
        return language.id === props.selectedLanguageId;
    });

    const supportsPluralForm =
        selectedLanguage.attributes.supports_plural_zero ||
        selectedLanguage.attributes.supports_plural_one ||
        selectedLanguage.attributes.supports_plural_two ||
        selectedLanguage.attributes.supports_plural_few ||
        selectedLanguage.attributes.supports_plural_many;

    let autoFocusItem: "zero" | "one" | "two" | "few" | "many" | "other";
    if (selectedLanguage.attributes.supports_plural_zero) {
        autoFocusItem = "zero";
    } else if (selectedLanguage.attributes.supports_plural_one) {
        autoFocusItem = "one";
    } else if (selectedLanguage.attributes.supports_plural_two) {
        autoFocusItem = "two";
    } else if (selectedLanguage.attributes.supports_plural_few) {
        autoFocusItem = "few";
    } else if (selectedLanguage.attributes.supports_plural_many) {
        autoFocusItem = "many";
    } else {
        autoFocusItem = "other";
    }

    if (translationLoading) {
        return <Loading />;
    }

    const pluralizationEnabled = props.keyResponse?.data.attributes.pluralization_enabled || props.forcePluralization;
    const htmlEnabled = props.keyResponse?.data.attributes.html_enabled || props.forceHTML;
    const editable = props.keyResponse.data.attributes.editable_for_current_user;

    return (
        <Form
            onFinish={async (values: IEditTranslationFormFormValues) => {
                try {
                    const response = await TranslationsAPI.createTranslation({
                        projectId: props.projectId,
                        languageId: selectedLanguage.id,
                        keyId: props.keyResponse.data.id,
                        zero: values.zero,
                        one: values.one,
                        two: values.two,
                        few: values.few,
                        many: values.many,
                        content: values.other,
                        exportConfigId: props.selectedExportConfigId
                    });

                    if (response.error) {
                        ErrorUtils.showError(`Error: ${response.error}`);
                    } else {
                        message.success("Succesfully updated translation.");

                        if (props.onSuccess) {
                            props.onSuccess(values);
                        }

                        if (props.clearFieldsAfterSubmit) {
                            form.resetFields();
                        }
                    }
                } catch (error) {
                    console.error(error);
                    ErrorUtils.showError("Failed to update translation");
                }
            }}
            onValuesChange={(_changedValues, values) => {
                if (props.onChange) {
                    props.onChange(values);
                }
            }}
            style={{ maxWidth: "100%", minWidth: 0, ...props.style }}
            id={props.formId}
            initialValues={
                translation && {
                    zero: translation.attributes.zero,
                    one: translation.attributes.one,
                    two: translation.attributes.two,
                    few: translation.attributes.few,
                    many: translation.attributes.many,
                    other: translation.attributes.content
                }
            }
            form={form}
        >
            {pluralizationEnabled && selectedLanguage.attributes.supports_plural_zero && (
                <>
                    <PluralFormHeading name="Zero" />
                    <Form.Item name="zero" rules={[{ required: false }]}>
                        {htmlEnabled ? (
                            <HTMLEditor disabled={!editable} />
                        ) : (
                            <TextArea
                                placeholder="Your translation"
                                autoFocus={autoFocusItem === "zero"}
                                disabled={!editable}
                            />
                        )}
                    </Form.Item>
                </>
            )}

            {pluralizationEnabled && selectedLanguage.attributes.supports_plural_one && (
                <>
                    <PluralFormHeading name="One" />
                    <Form.Item name="one" rules={[{ required: false }]}>
                        {htmlEnabled ? (
                            <HTMLEditor disabled={!editable} />
                        ) : (
                            <TextArea
                                placeholder="Your translation"
                                autoFocus={autoFocusItem === "one"}
                                disabled={!editable}
                            />
                        )}
                    </Form.Item>
                </>
            )}

            {pluralizationEnabled && selectedLanguage.attributes.supports_plural_two && (
                <>
                    <PluralFormHeading name="Two" />
                    <Form.Item name="two" rules={[{ required: false }]}>
                        {htmlEnabled ? (
                            <HTMLEditor disabled={!editable} />
                        ) : (
                            <TextArea
                                placeholder="Your translation"
                                autoFocus={autoFocusItem === "two"}
                                disabled={!editable}
                            />
                        )}
                    </Form.Item>
                </>
            )}

            {pluralizationEnabled && selectedLanguage.attributes.supports_plural_few && (
                <>
                    <PluralFormHeading name="Few" />
                    <Form.Item name="few" rules={[{ required: false }]}>
                        {htmlEnabled ? (
                            <HTMLEditor disabled={!editable} />
                        ) : (
                            <TextArea
                                placeholder="Your translation"
                                autoFocus={autoFocusItem === "few"}
                                disabled={!editable}
                            />
                        )}
                    </Form.Item>
                </>
            )}

            {pluralizationEnabled && selectedLanguage.attributes.supports_plural_many && (
                <>
                    <PluralFormHeading name="Many" />
                    <Form.Item name="many" rules={[{ required: false }]}>
                        {htmlEnabled ? (
                            <HTMLEditor disabled={!editable} />
                        ) : (
                            <TextArea
                                placeholder="Your translation"
                                autoFocus={autoFocusItem === "many"}
                                disabled={!editable}
                            />
                        )}
                    </Form.Item>
                </>
            )}

            {pluralizationEnabled && supportsPluralForm && <PluralFormHeading name="Other" />}
            <Form.Item name="other" rules={[{ required: false }]}>
                {htmlEnabled ? (
                    <HTMLEditor disabled={!editable} />
                ) : (
                    <TextArea
                        placeholder="Your translation"
                        autoFocus={autoFocusItem === "other"}
                        disabled={!editable}
                    />
                )}
            </Form.Item>
        </Form>
    );
}
