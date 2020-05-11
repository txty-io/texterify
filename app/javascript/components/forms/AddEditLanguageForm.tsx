import { QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal, Select, Tooltip } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { CountryCodesAPI } from "../api/v1/CountryCodesAPI";
import { LanguageCodesAPI } from "../api/v1/LanguageCodesAPI";
import { LanguagesAPI } from "../api/v1/LanguagesAPI";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";
import FlagIcon from "../ui/FlagIcons";

interface IProps {
    languageToEdit?: any;
    projectId: string;
    visible: boolean;
    onCancelRequest();
    onCreated?(): void;
}
interface IState {
    countryCodes: any[];
    languageCodes: any[];
    userChangedName: boolean;
}

class AddEditLanguageForm extends React.Component<IProps, IState> {
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

        if (response.errors) {
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
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.INVALID)]
                    }
                ]);
            } else {
                ErrorUtils.showErrors(response.errors);
            }

            return;
        }

        if (this.props.onCreated) {
            this.props.onCreated();
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
            <Modal
                maskClosable={false}
                title={this.props.languageToEdit ? "Edit language" : "Add a new language"}
                visible={this.props.visible}
                footer={
                    <div style={{ margin: "6px 0" }}>
                        <Button
                            onClick={() => {
                                this.props.onCancelRequest();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button form="addEditLanguageForm" type="primary" htmlType="submit">
                            {this.props.languageToEdit ? "Save changes" : "Create language"}
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
                destroyOnClose
                afterClose={() => {
                    this.setState({ userChangedName: false });
                }}
            >
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    id="addEditLanguageForm"
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
                        <span style={{ fontSize: 12, marginLeft: 8, fontWeight: "bold" }}>
                            (ISO 3166-1 alpha-2 code)
                        </span>
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
                        rules={[
                            { required: true, whitespace: true, message: "Please enter the name of the language." }
                        ]}
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
                        <Tooltip title="Mark the language as the default language.">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                </Form>
            </Modal>
        );
    }
}

export { AddEditLanguageForm };
