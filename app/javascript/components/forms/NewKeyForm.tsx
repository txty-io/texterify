import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Tooltip } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { KeysAPI } from "../api/v1/KeysAPI";
import { TranslationsAPI } from "../api/v1/TranslationsAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";
import { FeatureNotAvailable } from "../ui/FeatureNotAvailable";
import FlagIcon from "../ui/FlagIcons";
import { KeystrokeButtonWrapper } from "../ui/KeystrokeButtonWrapper";
import { KEYSTROKE_DEFINITIONS } from "../ui/KeystrokeDefinitions";
import { KeystrokeHandler } from "../ui/KeystrokeHandler";
import { KeyLimitAlert } from "../ui/payment/KeyLimitAlert";
import { TexterifyModal } from "../ui/TexterifyModal";
import { LanguageUtils } from "../utilities/LanguageUtils";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { EditTranslationForm, IEditTranslationFormFormValues } from "./EditTranslationForm";

interface IProps {
    projectId: string;
    visible: boolean;
    languagesResponse: any;
    onCancelRequest(): void;
    onCreated?(): void;
}

interface IState {
    defaultLangageTranslations: IEditTranslationFormFormValues;
}

interface IFormValues {
    name: string;
    description: string;
    htmlEnabled: boolean;
    pluralizationEnabled: boolean;
    defaultLanguageContent: string;
    defaultLangageTranslations: IEditTranslationFormFormValues;
}

class NewKeyForm extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        defaultLangageTranslations: null
    };

    handleSubmit = async (values: IFormValues) => {
        const response = await KeysAPI.createKey({
            projectId: this.props.projectId,
            name: values.name,
            description: values.description,
            htmlEnabled: values.htmlEnabled,
            pluralizationEnabled: values.pluralizationEnabled
        });

        if (!response || !response.data || response.errors) {
            if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                this.formRef.current?.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
                    }
                ]);
            } else if (ErrorUtils.hasError("name", ERRORS.KEY_NAME_RESERVED, response.errors)) {
                this.formRef.current?.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.KEY_NAME_RESERVED)]
                    }
                ]);
            } else {
                ErrorUtils.showErrors(response.errors);
            }

            return;
        }

        if (
            this.state.defaultLangageTranslations &&
            (this.state.defaultLangageTranslations.zero ||
                this.state.defaultLangageTranslations.one ||
                this.state.defaultLangageTranslations.two ||
                this.state.defaultLangageTranslations.few ||
                this.state.defaultLangageTranslations.many ||
                this.state.defaultLangageTranslations.other)
        ) {
            await TranslationsAPI.createTranslation({
                projectId: this.props.projectId,
                keyId: response.data.id,
                languageId: LanguageUtils.getDefaultLanguage(this.props.languagesResponse).id,
                zero: this.state.defaultLangageTranslations.zero,
                one: this.state.defaultLangageTranslations.one,
                two: this.state.defaultLangageTranslations.two,
                few: this.state.defaultLangageTranslations.few,
                many: this.state.defaultLangageTranslations.many,
                content: this.state.defaultLangageTranslations.other,
                triggerAutoTranslate: true
            });
        }

        if (this.props.onCreated) {
            this.props.onCreated();
        }
    };

    render() {
        const defaultLanguage = this.props.languagesResponse?.data
            ? LanguageUtils.getDefaultLanguage(this.props.languagesResponse)
            : null;

        const countryCode = APIUtils.getIncludedObject(
            defaultLanguage?.relationships.country_code.data,
            this.props.languagesResponse?.included || []
        );

        return (
            <>
                <TexterifyModal
                    title="Add a new key"
                    visible={this.props.visible}
                    footer={
                        <div style={{ margin: "6px 0" }}>
                            <Button
                                onClick={() => {
                                    this.props.onCancelRequest();
                                }}
                            >
                                Cancel <KeystrokeButtonWrapper keys={KEYSTROKE_DEFINITIONS.CLOSE_MODAL} />
                            </Button>
                            <Button
                                form="newKeyForm"
                                type="primary"
                                htmlType="submit"
                                data-id="key-form-submit-button"
                                disabled={dashboardStore.getProjectOrganization()?.attributes.key_limit_reached}
                            >
                                Create key <KeystrokeButtonWrapper keys={KEYSTROKE_DEFINITIONS.SUBMIT_MODAL_FORM} />
                            </Button>
                        </div>
                    }
                    onCancel={this.props.onCancelRequest}
                >
                    <Form
                        ref={this.formRef}
                        id="newKeyForm"
                        onFinish={this.handleSubmit}
                        onChange={() => {
                            // Reset state to force a rerender because otherwise the checkboxes are not recognized correctly.
                            this.setState(this.state);
                        }}
                        style={{ maxWidth: "100%" }}
                        initialValues={{ htmlEnabled: false }}
                    >
                        <h3>Name *</h3>
                        <Form.Item
                            name="name"
                            rules={[{ required: true, whitespace: true, message: "Please enter the name of the key." }]}
                        >
                            <Input placeholder="Name" autoFocus />
                        </Form.Item>

                        <h3>Description</h3>
                        <Form.Item name="description" rules={[{ required: false }]}>
                            <Input placeholder="Description" />
                        </Form.Item>

                        <Form.Item noStyle shouldUpdate>
                            {() => {
                                return (
                                    <>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <Form.Item
                                                name="htmlEnabled"
                                                rules={[{ required: false }]}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Checkbox
                                                    disabled={
                                                        !PermissionUtils.isDeveloperOrHigher(
                                                            dashboardStore.getCurrentRole()
                                                        ) || !dashboardStore.featureEnabled("FEATURE_HTML_EDITOR")
                                                    }
                                                >
                                                    HTML
                                                </Checkbox>
                                            </Form.Item>
                                            <Tooltip title="If checked a editor will be used for translation that helps you to create HTML content. You can always change this later.">
                                                <QuestionCircleOutlined />
                                            </Tooltip>
                                            {!dashboardStore.featureEnabled("FEATURE_HTML_EDITOR") && (
                                                <FeatureNotAvailable
                                                    feature="FEATURE_HTML_EDITOR"
                                                    style={{ marginLeft: 16 }}
                                                />
                                            )}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
                                            <Form.Item
                                                name="pluralizationEnabled"
                                                rules={[{ required: false }]}
                                                valuePropName="checked"
                                                style={{ marginBottom: 0 }}
                                            >
                                                <Checkbox>Enable pluralization</Checkbox>
                                            </Form.Item>
                                        </div>

                                        <KeyLimitAlert
                                            project={dashboardStore.currentProject}
                                            refetchTrigger={0}
                                            style={{ marginTop: 16 }}
                                        />
                                    </>
                                );
                            }}
                        </Form.Item>
                    </Form>

                    {defaultLanguage && (
                        <>
                            <h3 style={{ marginTop: 24 }}>
                                {countryCode && (
                                    <span style={{ marginRight: 8 }}>
                                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                    </span>
                                )}
                                {defaultLanguage.attributes.name}
                            </h3>
                            <EditTranslationForm
                                languagesResponse={this.props.languagesResponse}
                                projectId={this.props.projectId}
                                selectedLanguageId={defaultLanguage.id}
                                selectedExportConfigId={null}
                                onChange={(values) => {
                                    this.setState({ defaultLangageTranslations: values });
                                }}
                                forceHTML={this.formRef.current?.getFieldValue("htmlEnabled")}
                                forcePluralization={this.formRef.current?.getFieldValue("pluralizationEnabled")}
                            />
                        </>
                    )}
                </TexterifyModal>

                <KeystrokeHandler
                    keys={KEYSTROKE_DEFINITIONS.SUBMIT_MODAL_FORM}
                    onActivated={() => {
                        this.formRef.current?.submit();
                    }}
                />
            </>
        );
    }
}

export { NewKeyForm };
