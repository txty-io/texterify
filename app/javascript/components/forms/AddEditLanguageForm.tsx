import { Button, Checkbox, Input, Modal, Select, Tooltip, Form } from "antd";
import * as React from "react";
import { CountryCodesAPI } from "../api/v1/CountryCodesAPI";
import { LanguageCodesAPI } from "../api/v1/LanguageCodesAPI";
import { LanguagesAPI } from "../api/v1/LanguagesAPI";
import FlagIcon from "../ui/FlagIcons";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface IProps {
    languageToEdit?: any;
    form: any;
    projectId: string;
    visible: boolean;
    onCancelRequest();
    onCreated?(): void;
}
interface IState {
    countryCodes: any[];
    languageCodes: any[];
}

class AddEditLanguageForm extends React.Component<IProps, IState> {
    state: IState = {
        countryCodes: [],
        languageCodes: []
    };

    async componentDidMount() {
        try {
            const countryCodes = await CountryCodesAPI.getCountryCodes();
            this.setState({
                countryCodes: countryCodes.data
            });
        } catch (err) {
            if (!err.isCanceled) {
                console.error(err);
            }
        }

        try {
            const languageCodes = await LanguageCodesAPI.getAll();
            this.setState({
                languageCodes: languageCodes.data
            });
        } catch (err) {
            if (!err.isCanceled) {
                console.error(err);
            }
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
            response.errors.map((error) => {
                if (error.details === "A language with that name already exists for this project.") {
                    this.props.form.setFields({
                        name: {
                            value: values.name,
                            errors: [new Error(error.details)]
                        }
                    });
                }
            });

            return;
        }

        if (this.props.onCreated) {
            this.props.onCreated();
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
            >
                <Form
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    id="addEditLanguageForm"
                    initialValues={
                        this.props.languageToEdit && {
                            name: this.props.languageToEdit.attributes.name,
                            countryCode:
                                this.props.languageToEdit.relationships &&
                                this.props.languageToEdit.relationships.country_code &&
                                this.props.languageToEdit.relationships.country_code.data
                                    ? this.props.languageToEdit.relationships.country_code.data.id
                                    : undefined,
                            languageCode:
                                this.props.languageToEdit.relationships &&
                                this.props.languageToEdit.relationships.language_code &&
                                this.props.languageToEdit.relationships.language_code.data
                                    ? this.props.languageToEdit.relationships.language_code.data.id
                                    : undefined,
                            is_default: this.props.languageToEdit.attributes.is_default || false
                        }
                    }
                >
                    <h3>Name *</h3>
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: "Please enter the name of the language." }]}
                    >
                        <Input placeholder="Name" autoFocus />
                    </Form.Item>

                    <h3>
                        Country{" "}
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
                                    <Select.Option key={countryCode.id}>
                                        <span style={{ marginRight: 8 }}>
                                            <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                        </span>
                                        {`${countryCode.attributes.name} (${countryCode.attributes.code})`}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    <h3>
                        Language{" "}
                        <span style={{ fontSize: 12, marginLeft: 8, fontWeight: "bold" }}>(ISO 639-1 code)</span>
                    </h3>
                    <Form.Item name="languageCode" rules={[]}>
                        <Select
                            showSearch
                            placeholder="Select a language"
                            optionFilterProp="children"
                            filterOption
                            style={{ width: "100%" }}
                        >
                            {this.state.languageCodes.map((languageCode) => {
                                return (
                                    <Select.Option key={languageCode.id}>
                                        {`${languageCode.attributes.name} (${languageCode.attributes.code})`}
                                    </Select.Option>
                                );
                            })}
                        </Select>
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
