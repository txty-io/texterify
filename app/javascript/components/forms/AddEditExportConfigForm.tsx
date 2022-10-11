import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Empty, Form, Input, Modal, Select, Table } from "antd";
import { FormInstance } from "antd/lib/form";
import Paragraph from "antd/lib/typography/Paragraph";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { ExportConfigsAPI, IExportConfig } from "../api/v1/ExportConfigsAPI";
import { IGetLanguageConfigsResponse, LanguageConfigsAPI } from "../api/v1/LanguageConfigsAPI";
import { IGetLanguagesResponse, LanguagesAPI } from "../api/v1/LanguagesAPI";
import { FileFormatOptions } from "../configs/FileFormatOptions";
import { ImportFileFormats } from "../sites/dashboard/FileImportSite";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";
import FlagIcon from "../ui/FlagIcons";
import { AddEditExportConfigLanguageForm, ICreateUpdateLanguageConfig } from "./AddEditExportConfigLanguageForm";

interface IFormValues {
    name: string;
    fileFormat: ImportFileFormats;
    filePath: string;
    defaultLanguageFilePath: string;
    splitOn: string;
}

interface IProps {
    exportConfigToEdit?: IExportConfig;
    projectId: string;
    hideDefaultSubmitButton?: boolean;
    clearFieldsAfterSubmit?: boolean;
    onCreated?(): void;
}
interface IState {
    exportConfigsResponse: any;
    languagesResponse: IGetLanguagesResponse;
    languageConfigsResponse: IGetLanguageConfigsResponse;
    languageConfigsLoading: boolean;
    addEditExportConfigLanguageConfigOpen: boolean;
    exportConfigLanguageConfigToEdit: ICreateUpdateLanguageConfig;
    languageConfigsToCreate: ICreateUpdateLanguageConfig[];
    selectedFileFormat: ImportFileFormats | null;
}

class AddEditExportConfigForm extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        exportConfigsResponse: null,
        languagesResponse: null,
        languageConfigsResponse: null,
        languageConfigsLoading: true,
        addEditExportConfigLanguageConfigOpen: false,
        exportConfigLanguageConfigToEdit: null,
        languageConfigsToCreate: [],
        selectedFileFormat: null
    };

    async componentDidMount() {
        try {
            const exportConfigsResponse = await ExportConfigsAPI.getExportConfigs({ projectId: this.props.projectId });
            const languagesResponse = await LanguagesAPI.getLanguages(this.props.projectId, { showAll: true });

            let languageConfigsResponse = null;
            if (this.props.exportConfigToEdit) {
                languageConfigsResponse = await LanguageConfigsAPI.getLanguageConfigs({
                    projectId: this.props.projectId,
                    exportConfigId: this.props.exportConfigToEdit.id
                });
            }

            this.setState({
                exportConfigsResponse: exportConfigsResponse,
                languagesResponse: languagesResponse,
                languageConfigsResponse: languageConfigsResponse,
                languageConfigsLoading: false
            });
        } catch (error) {
            console.error(error);
        }
    }

    handleSubmit = async (values: IFormValues) => {
        let response;

        if (this.props.exportConfigToEdit) {
            response = await ExportConfigsAPI.updateExportConfig({
                projectId: this.props.projectId,
                defaultLanguageFilePath: values.defaultLanguageFilePath,
                fileFormat: values.fileFormat,
                exportConfigId: this.props.exportConfigToEdit.id,
                filePath: values.filePath,
                name: values.name,
                splitOn: values.splitOn
            });
        } else {
            response = await ExportConfigsAPI.createExportConfig({
                projectId: this.props.projectId,
                defaultLanguageFilePath: values.defaultLanguageFilePath,
                fileFormat: values.fileFormat,
                filePath: values.filePath,
                name: values.name,
                splitOn: values.splitOn
            });
        }

        if (response.errors) {
            if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                this.formRef.current?.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
                    }
                ]);
            } else {
                ErrorUtils.showErrors(response.errors);
            }

            return;
        }

        for (const changedLanguageConfig of this.state.languageConfigsToCreate) {
            await LanguageConfigsAPI.createLanguageConfig({
                projectId: this.props.projectId,
                exportConfigId: response.data.id,
                languageId: changedLanguageConfig.languageId,
                languageCode: changedLanguageConfig.languageCode
            });
        }

        if (this.props.onCreated) {
            this.props.onCreated();
        }

        if (this.props.clearFieldsAfterSubmit) {
            this.formRef.current?.resetFields();
        }
    };

    onDelete = async (createUpdateLanguageConfig: ICreateUpdateLanguageConfig) => {
        Modal.confirm({
            title: "Do you really want to delete this language config?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            onOk: async () => {
                if (createUpdateLanguageConfig.id) {
                    await LanguageConfigsAPI.deleteLanguageConfig({
                        projectId: this.props.projectId,
                        exportConfigId: this.props.exportConfigToEdit.id,
                        languageConfigId: createUpdateLanguageConfig.id
                    });

                    await this.reloadLanguageConfigs();
                } else {
                    this.setState({
                        languageConfigsToCreate: this.state.languageConfigsToCreate.filter((item) => {
                            return item.languageId !== createUpdateLanguageConfig.languageId;
                        })
                    });
                }
            }
        });
    };

    reloadLanguageConfigs = async () => {
        this.setState({
            languageConfigsLoading: true
        });

        const languageConfigsResponse = await LanguageConfigsAPI.getLanguageConfigs({
            projectId: this.props.projectId,
            exportConfigId: this.props.exportConfigToEdit.id
        });

        this.setState({
            languageConfigsResponse: languageConfigsResponse,
            languageConfigsLoading: false
        });
    };

    getRows = () => {
        const existingLanguageConfigs =
            this.state.languageConfigsResponse?.data
                .filter((languageConfig) => {
                    return !this.state.languageConfigsToCreate.find((languageConfigToCreate) => {
                        return languageConfig.attributes.language_id === languageConfigToCreate.languageId;
                    });
                })
                .map((languageConfig) => {
                    const language = this.state.languagesResponse?.data.find((languageToFind) => {
                        return languageConfig.attributes.language_id === languageToFind.id;
                    });

                    const countryCode = APIUtils.getIncludedObject(
                        language?.relationships.country_code.data,
                        this.state.languagesResponse.included
                    );

                    return {
                        id: languageConfig.id,
                        languageId: languageConfig.attributes.language_id,
                        languageCode: languageConfig.attributes.language_code,
                        languageName: language?.attributes.name,
                        countryCode: countryCode?.attributes.code.toLowerCase()
                    };
                }) || [];

        return [...this.state.languageConfigsToCreate, ...existingLanguageConfigs]
            .sort((a, b) => {
                return a.languageName.toLowerCase() < b.languageName.toLowerCase() ? -1 : 1;
            })
            .map((item) => {
                return {
                    key: item.languageId,
                    languageName: item.countryCode ? (
                        <>
                            <span style={{ marginRight: 8 }}>
                                <FlagIcon code={item.countryCode} />
                            </span>
                            {item.languageName}
                        </>
                    ) : (
                        item.languageName
                    ),
                    languageCode: item.languageCode,
                    controls: (
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Button
                                onClick={() => {
                                    this.setState({
                                        addEditExportConfigLanguageConfigOpen: true,
                                        exportConfigLanguageConfigToEdit: item
                                    });
                                }}
                                type="link"
                            >
                                <EditOutlined />
                            </Button>
                            <Button
                                onClick={() => {
                                    this.onDelete(item);
                                }}
                                style={{ marginLeft: 8 }}
                                type="link"
                            >
                                <DeleteOutlined />
                            </Button>
                        </div>
                    )
                };
            });
    };

    getColumns = () => {
        return [
            {
                title: "Language",
                dataIndex: "languageName",
                key: "languageName"
            },
            {
                title: "Overriden language code",
                dataIndex: "languageCode",
                key: "languageCode"
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50
            }
        ];
    };

    render() {
        return (
            <>
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%", display: "flex", flexDirection: "column" }}
                    id="addEditExportConfigForm"
                    initialValues={
                        this.props.exportConfigToEdit && {
                            name: this.props.exportConfigToEdit.attributes.name,
                            splitOn: this.props.exportConfigToEdit.attributes.split_on,
                            fileFormat: this.props.exportConfigToEdit.attributes.file_format,
                            filePath: this.props.exportConfigToEdit.attributes.file_path,
                            defaultLanguageFilePath: this.props.exportConfigToEdit.attributes.default_language_file_path
                        }
                    }
                    onValuesChange={(changedValues: IFormValues) => {
                        if (changedValues.fileFormat) {
                            this.setState({ selectedFileFormat: changedValues.fileFormat });
                        }
                    }}
                >
                    <h3>Name *</h3>
                    <Form.Item
                        name="name"
                        rules={[
                            { required: true, whitespace: true, message: "Please enter the name of the export config." }
                        ]}
                    >
                        <Input placeholder="Name" autoFocus />
                    </Form.Item>

                    <h3>File format *</h3>
                    <Form.Item
                        name="fileFormat"
                        rules={[
                            { required: true, whitespace: true, message: "Please enter the file format of the files." }
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a file format"
                            optionFilterProp="children"
                            filterOption
                            style={{ width: "100%" }}
                        >
                            {FileFormatOptions.map((fileFormat, index) => {
                                return (
                                    <Select.Option value={fileFormat.value} key={index}>
                                        {fileFormat.text}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    {(this.state.selectedFileFormat === "json" ||
                        (this.state.selectedFileFormat === null &&
                            this.props.exportConfigToEdit?.attributes.file_format)) && (
                        <>
                            <h3>Split keys on</h3>
                            <p>
                                Provide a string upon which the JSON keys are split and grouped together. This way you
                                can created nested JSON.
                            </p>
                            <Form.Item name="splitOn">
                                <Input placeholder="For example: ." />
                            </Form.Item>
                        </>
                    )}

                    <h3>File path *</h3>
                    <p>The file path specifies where files are placed in the exported folder.</p>

                    <p>You can make use of the following variables to create dynamic paths:</p>
                    <div style={{ display: "flex" }}>
                        <Paragraph code copyable style={{ marginRight: 24 }}>
                            {"{languageCode}"}
                        </Paragraph>
                        <Paragraph code copyable>
                            {"{countryCode}"}
                        </Paragraph>
                    </div>
                    <Form.Item
                        name="filePath"
                        rules={[
                            { required: true, whitespace: true, message: "Please enter the file path of the files." }
                        ]}
                    >
                        <Input placeholder="File path" />
                    </Form.Item>

                    <h3>Default language file path</h3>
                    <p>A special file path for the default language if available.</p>
                    <Form.Item name="defaultLanguageFilePath" rules={[]}>
                        <Input placeholder="Default language file path" />
                    </Form.Item>

                    <h3>Override language codes</h3>
                    <p>Override the language codes used for exports in this configuration.</p>
                    <div style={{ display: "flex" }}>
                        <Button
                            style={{ marginTop: 8, marginLeft: "auto" }}
                            onClick={() => {
                                this.setState({ addEditExportConfigLanguageConfigOpen: true });
                            }}
                        >
                            Add new language code override
                        </Button>
                    </div>
                    <Table
                        dataSource={this.getRows()}
                        columns={this.getColumns()}
                        style={{ marginTop: 16 }}
                        bordered
                        pagination={false}
                        loading={this.state.languageConfigsLoading}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No language code overrides found"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                    />
                    {!this.props.hideDefaultSubmitButton && (
                        <Button type="primary" htmlType="submit" style={{ marginLeft: "auto", marginTop: 24 }}>
                            {this.props.exportConfigToEdit ? "Save changes" : "Add export config"}
                        </Button>
                    )}
                </Form>

                <AddEditExportConfigLanguageForm
                    languagesResponse={this.state.languagesResponse}
                    languageConfigsResponse={this.state.languageConfigsResponse}
                    projectId={this.props.projectId}
                    languageConfigsToCreate={this.state.languageConfigsToCreate}
                    exportConfigLanguageConfigToEdit={this.state.exportConfigLanguageConfigToEdit}
                    visible={this.state.addEditExportConfigLanguageConfigOpen}
                    onCreate={async (exportConfigLanguageConfig) => {
                        if (this.props.exportConfigToEdit) {
                            await LanguageConfigsAPI.createLanguageConfig({
                                projectId: this.props.projectId,
                                exportConfigId: this.props.exportConfigToEdit.id,
                                languageId: exportConfigLanguageConfig.languageId,
                                languageCode: exportConfigLanguageConfig.languageCode
                            });

                            await this.reloadLanguageConfigs();
                        } else {
                            this.setState({
                                languageConfigsToCreate: [
                                    ...this.state.languageConfigsToCreate.filter((item) => {
                                        return item.languageId !== exportConfigLanguageConfig.languageId;
                                    }),
                                    exportConfigLanguageConfig
                                ]
                            });
                        }

                        this.setState({
                            addEditExportConfigLanguageConfigOpen: false
                        });
                    }}
                    onUpdate={async (exportConfigLanguageConfig) => {
                        if (this.props.exportConfigToEdit) {
                            await LanguageConfigsAPI.updateLanguageConfig({
                                projectId: this.props.projectId,
                                exportConfigId: this.props.exportConfigToEdit.id,
                                languageConfigId: exportConfigLanguageConfig.id,
                                languageCode: exportConfigLanguageConfig.languageCode,
                                languageId: exportConfigLanguageConfig.languageId
                            });

                            await this.reloadLanguageConfigs();
                        } else {
                            this.setState({
                                languageConfigsToCreate: [
                                    ...this.state.languageConfigsToCreate.filter((item) => {
                                        return item.languageId !== exportConfigLanguageConfig.languageId;
                                    }),
                                    exportConfigLanguageConfig
                                ]
                            });
                        }

                        this.setState({
                            addEditExportConfigLanguageConfigOpen: false
                        });
                    }}
                    onCancelRequest={() => {
                        this.setState({
                            addEditExportConfigLanguageConfigOpen: false,
                            exportConfigLanguageConfigToEdit: null
                        });
                    }}
                />
            </>
        );
    }
}

export { AddEditExportConfigForm };
