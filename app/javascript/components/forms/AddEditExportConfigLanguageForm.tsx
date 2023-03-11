import { Button, Form, Input, Select, Tooltip } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import FlagIcon from "../ui/FlagIcons";
import { CustomModal } from "../ui/CustomModal";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { IGetLanguageConfigsResponse } from "../api/v1/LanguageConfigsAPI";

export interface ICreateUpdateLanguageConfig {
    id?: string;
    languageId: string;
    languageCode: string;
    languageName: string;
    countryCode: string;
}

interface IProps {
    languagesResponse: any;
    languageConfigsResponse: IGetLanguageConfigsResponse;
    languageConfigsToCreate: ICreateUpdateLanguageConfig[];
    exportConfigLanguageConfigToEdit?: ICreateUpdateLanguageConfig;
    projectId: string;
    visible: boolean;
    onCancelRequest();
    onCreate(exportConfigLanguageConfig: ICreateUpdateLanguageConfig): void;
    onUpdate(exportConfigLanguageConfig: ICreateUpdateLanguageConfig): void;
}

interface IFormValues {
    languageId: string;
    languageCode: string;
}

class AddEditExportConfigLanguageForm extends React.Component<IProps> {
    formRef = React.createRef<FormInstance>();

    handleSubmit = async (values: IFormValues) => {
        const language = this.props.languagesResponse?.data.find((item) => {
            return item.id === values.languageId;
        });

        const countryCode = APIUtils.getIncludedObject(
            language.relationships.country_code.data,
            this.props.languagesResponse.included
        );

        const createUpdateLanguageConfig: ICreateUpdateLanguageConfig = {
            id: this.props.exportConfigLanguageConfigToEdit?.id,
            languageId: values.languageId,
            languageCode: values.languageCode,
            languageName: language.attributes.name,
            countryCode: countryCode?.attributes.code.toLowerCase()
        };

        // If the item has an id it already exists on the server and must be updated.
        if (this.props.exportConfigLanguageConfigToEdit?.id) {
            this.props.onUpdate(createUpdateLanguageConfig);
        } else {
            this.props.onCreate(createUpdateLanguageConfig);
        }
    };

    render() {
        return (
            <CustomModal
                title={
                    this.props.exportConfigLanguageConfigToEdit ? "Edit language config" : "Add a new language config"
                }
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
                        <Button form="addEditExportConfigLanguageForm" type="primary" htmlType="submit">
                            {this.props.exportConfigLanguageConfigToEdit ? "Save changes" : "Create config"}
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    id="addEditExportConfigLanguageForm"
                    initialValues={
                        this.props.exportConfigLanguageConfigToEdit && {
                            languageId: this.props.exportConfigLanguageConfigToEdit.languageId,
                            languageCode: this.props.exportConfigLanguageConfigToEdit.languageCode
                        }
                    }
                >
                    <h3>Language</h3>
                    <Form.Item
                        name="languageId"
                        rules={[{ required: true, whitespace: true, message: "Please select a language." }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a language"
                            optionFilterProp="children"
                            filterOption
                            style={{ width: "100%" }}
                        >
                            {this.props.languagesResponse?.data
                                .filter((language) => {
                                    return (
                                        this.props.exportConfigLanguageConfigToEdit?.languageId === language.id ||
                                        (!this.props.languageConfigsResponse?.data.find((languageConfig) => {
                                            return languageConfig.attributes.language_id === language.id;
                                        }) &&
                                            !this.props.languageConfigsToCreate.find((languageConfig) => {
                                                return languageConfig.languageId === language.id;
                                            }))
                                    );
                                })
                                .map((language, index) => {
                                    const countryCode = APIUtils.getIncludedObject(
                                        language.relationships.country_code.data,
                                        this.props.languagesResponse.included
                                    );

                                    return (
                                        <Select.Option value={language.attributes.id} key={index}>
                                            {countryCode && (
                                                <span style={{ marginRight: 8 }}>
                                                    <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                                </span>
                                            )}
                                            {language.attributes.name}
                                        </Select.Option>
                                    );
                                })}
                        </Select>
                    </Form.Item>

                    <h3>Override language code</h3>
                    <Form.Item
                        name="languageCode"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: (
                                    <>
                                        <span style={{ marginRight: 8 }}>Please enter a valid language code.</span>
                                        <Tooltip
                                            title="The language code must start with a letter and must not contain anything other
                                        than letters and numbers."
                                        >
                                            <QuestionCircleOutlined />
                                        </Tooltip>
                                    </>
                                ),
                                pattern: new RegExp(/^[A-Za-z_][A-Za-z0-9_]*$/)
                            }
                        ]}
                    >
                        <Input placeholder="Language code" />
                    </Form.Item>
                </Form>
            </CustomModal>
        );
    }
}

export { AddEditExportConfigLanguageForm };
