import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Select, Tooltip } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { CountryCodesAPI } from "../api/v1/CountryCodesAPI";
import { LanguageCodesAPI } from "../api/v1/LanguageCodesAPI";
import { LanguagesAPI } from "../api/v1/LanguagesAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";
import FlagIcon from "../ui/FlagIcons";

export interface IAddEditLanguageFormProps {
    languageToEdit?: any;
    projectId: string;
    hideDefaultSubmitButton?: boolean;
    clearFieldsAfterSubmit?: boolean;
    formId?: string;
    onCreated?(): void;
}
interface IState {
    countryCodes: any[];
    languageCodes: any[];
    userChangedName: boolean;
}

class AddEditLanguageForm extends React.Component<IAddEditLanguageFormProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        countryCodes: [],
        languageCodes: [],
        userChangedName: false
    };

    async componentDidMount() {
        try {
            const countryCodes = await CountryCodesAPI.getCountryCodes();
            this.setState({
                countryCodes: countryCodes.data
            });
        } catch (err) {
            console.error(err);
        }

        try {
            const languageCodes = await LanguageCodesAPI.getAll();
            this.setState({
                languageCodes: languageCodes.data
            });
        } catch (err) {
            console.error(err);
        }
    }

    handleSubmit = async (values: any) => {
        let response;

        if (this.props.languageToEdit) {
            response = await LanguagesAPI.updateLanguage({
                projectId: this.props.projectId,
                languageId: this.props.languageToEdit.id,
                name: values.name,
                countryCode: values.countryCode,
                languageCode: values.languageCode,
                isDefault: values.is_default
            });
        } else {
            response = await LanguagesAPI.createLanguage({
                projectId: this.props.projectId,
                name: values.name,
                countryCode: values.countryCode,
                languageCode: values.languageCode,
                isDefault: values.is_default
            });
        }

        if (response.error) {
            if (response.message === "MAXIMUM_NUMBER_OF_LANGUAGES_REACHED") {
                if (dashboardStore.getProjectOrganization()) {
                    ErrorUtils.showError(
                        "You have reached the maximum number of languages for a project on the free plan. Please upgrade to a paid plan to add more languages."
                    );
                } else {
                    ErrorUtils.showError(
                        "You have reached the maximum number of languages for private projects. Move the project to an organization to create more languages."
                    );
                }
            }
        } else if (response.errors) {
            if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                this.formRef.current.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
                    }
                ]);
            } else if (ErrorUtils.hasError("name", ERRORS.INVALID, response.errors)) {
                this.formRef.current.setFields([
                    {
                        name: "name",
                        errors: [
                            "Name must start with a letter or an underscore and can only contain alphanumeric characters and underscores."
                        ]
                    }
                ]);
            } else {
                ErrorUtils.showErrors(response.errors);
            }

            return;
        } else {
            if (this.props.onCreated) {
                this.props.onCreated();
            }

            if (this.props.clearFieldsAfterSubmit) {
                this.formRef.current.resetFields();
            }
        }
    };

    prefillName = () => {
        if (!this.state.userChangedName && !this.props.languageToEdit) {
            const languageCodeID = this.formRef.current.getFieldValue("languageCode");

            const language = this.state.languageCodes.find((languageCode) => {
                return languageCode.id === languageCodeID;
            });

            if (language) {
                this.formRef.current.setFieldsValue({
                    name: language.attributes.name
                });
            }
        }
    };

    render() {
        return (
            <Form
                ref={this.formRef}
                onFinish={this.handleSubmit}
                style={{ maxWidth: "100%", minWidth: 0 }}
                id={this.props.formId}
                initialValues={
                    this.props.languageToEdit && {
                        name: this.props.languageToEdit.attributes.name,
                        countryCode: this.props.languageToEdit.relationships?.country_code?.data?.id,
                        languageCode: this.props.languageToEdit.relationships?.language_code?.data?.id,
                        is_default: this.props.languageToEdit.attributes.is_default || false
                    }
                }
            >
                <h3>
                    Language
                    <span style={{ fontSize: 12, marginLeft: 8, fontWeight: "bold" }}>(ISO 639-1 code)</span>
                </h3>
                <Form.Item name="languageCode" rules={[]}>
                    <Select
                        showSearch
                        placeholder="Select a language"
                        optionFilterProp="children"
                        filterOption
                        style={{ width: "100%" }}
                        onSelect={this.prefillName}
                    >
                        {this.state.languageCodes.map((languageCode) => {
                            return (
                                <Select.Option key={languageCode.id} value={undefined}>
                                    {`${languageCode.attributes.name} (${languageCode.attributes.code})`}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                <h3>
                    Country
                    <span style={{ fontSize: 12, marginLeft: 8, fontWeight: "bold" }}>(ISO 3166-1 alpha-2 code)</span>
                </h3>
                <Form.Item name="countryCode" rules={[]}>
                    <Select
                        showSearch
                        placeholder="Select a country"
                        optionFilterProp="children"
                        filterOption
                        style={{ width: "100%" }}
                    >
                        {this.state.countryCodes.map((countryCode) => {
                            return (
                                <Select.Option key={countryCode.id} value={undefined}>
                                    <span style={{ marginRight: 8 }}>
                                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                    </span>
                                    {`${countryCode.attributes.name} (${countryCode.attributes.code})`}
                                </Select.Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                <h3>Name *</h3>
                <Form.Item
                    name="name"
                    rules={[{ required: true, whitespace: true, message: "Please enter the name of the language." }]}
                >
                    <Input
                        placeholder="Name"
                        onChange={() => {
                            this.setState({ userChangedName: true });
                        }}
                    />
                </Form.Item>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <Form.Item
                        name="is_default"
                        rules={[{ required: false }]}
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                    >
                        <Checkbox>Default language</Checkbox>
                    </Form.Item>
                    <Tooltip title="Mark the language as the default language. You can specify custom export settings and directly add a translation for new keys in the default language.">
                        <QuestionCircleOutlined />
                    </Tooltip>
                    {!this.props.hideDefaultSubmitButton && (
                        <Button type="primary" htmlType="submit" style={{ marginLeft: "auto" }}>
                            {this.props.languageToEdit ? "Save changes" : "Add language"}
                        </Button>
                    )}
                </div>
            </Form>
        );
    }
}

export { AddEditLanguageForm };
