import { Button, Empty, Form, Input, Select, Table, Modal } from "antd";
import { FormInstance } from "antd/lib/form";
import Paragraph from "antd/lib/typography/Paragraph";
import * as React from "react";
import { ExportConfigsAPI } from "../api/v1/ExportConfigsAPI";
import { LanguagesAPI } from "../api/v1/LanguagesAPI";
import { FileFormatOptions } from "../configs/FileFormatOptions";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";
import { AddEditExportConfigLanguageForm, ICreateUpdateLanguageConfig } from "./AddEditExportConfigLanguageForm";
import FlagIcon from "../ui/FlagIcons";
import { DeleteOutlined } from "@ant-design/icons";

interface IFormValues {
    name: string;
    fileFormat: string;
    filePath: string;
    defaultLanguageFilePath: string;
}

interface IProps {
    exportConfigToEdit?: any;
    projectId: string;
    visible: boolean;
    onCreated?(): void;
}
interface IState {
    exportConfigsResponse: any;
    languagesResponse: any;
    addEditExportConfigLanguageConfigOpen: boolean;
    exportConfigLanguageConfigToEdit: ICreateUpdateLanguageConfig;
    languageConfigsChanged: ICreateUpdateLanguageConfig[];
}

class AddEditExportConfigForm extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        exportConfigsResponse: null,
        languagesResponse: null,
        addEditExportConfigLanguageConfigOpen: false,
        exportConfigLanguageConfigToEdit: null,
        languageConfigsChanged: []
    };

    async componentDidMount() {
        try {
            const exportConfigsResponse = await ExportConfigsAPI.getExportConfigs({ projectId: this.props.projectId });
            const languagesResponse = await LanguagesAPI.getLanguages(this.props.projectId);

            this.setState({
                exportConfigsResponse: exportConfigsResponse,
                languagesResponse: languagesResponse
            });
        } catch (err) {
            console.error(err);
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
                name: values.name
            });
        } else {
            response = await ExportConfigsAPI.createExportConfig({
                projectId: this.props.projectId,
                defaultLanguageFilePath: values.defaultLanguageFilePath,
                fileFormat: values.fileFormat,
                filePath: values.filePath,
                name: values.name
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
            } else {
                ErrorUtils.showErrors(response.errors);
            }

            return;
        }

        if (this.props.onCreated) {
            this.props.onCreated();
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
                this.setState({
                    languageConfigsChanged: this.state.languageConfigsChanged.filter((item) => {
                        return item.languageId !== createUpdateLanguageConfig.languageId;
                    })
                });
            }
        });
    };

    getRows = () => {
        return this.state.languageConfigsChanged
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
                            >
                                Edit
                            </Button>
                            <Button
                                onClick={() => {
                                    this.onDelete(item);
                                }}
                                style={{ marginLeft: 8 }}
                            >
                                <DeleteOutlined type="delete" key="delete" />
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
                    style={{ maxWidth: "100%" }}
                    id="addEditExportConfigForm"
                    initialValues={
                        this.props.exportConfigToEdit && {
                            name: this.props.exportConfigToEdit.attributes.name,
                            fileFormat: this.props.exportConfigToEdit.attributes.file_format,
                            filePath: this.props.exportConfigToEdit.attributes.file_path,
                            defaultLanguageFilePath: this.props.exportConfigToEdit.attributes.default_language_file_path
                        }
                    }
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

                    <h3>Language configs</h3>
                    <p>
                        Override the language codes used for exports in this configuration. You can learn more here when
                        this can be helpful.
                    </p>
                    <div style={{ display: "flex" }}>
                        <Button
                            type="primary"
                            style={{ marginTop: 8, marginLeft: "auto" }}
                            onClick={() => {
                                this.setState({ addEditExportConfigLanguageConfigOpen: true });
                            }}
                        >
                            Add new config
                        </Button>
                    </div>
                    <Table
                        dataSource={this.getRows()}
                        columns={this.getColumns()}
                        style={{ marginTop: 16 }}
                        bordered
                        size="middle"
                        locale={{
                            emptyText: (
                                <Empty description="No language configs found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )
                        }}
                    />
                </Form>

                <AddEditExportConfigLanguageForm
                    languagesResponse={this.state.languagesResponse}
                    projectId={this.props.projectId}
                    exportConfigLanguageConfigToEdit={this.state.exportConfigLanguageConfigToEdit}
                    visible={this.state.addEditExportConfigLanguageConfigOpen}
                    onCreate={async (exportConfigLanguageConfig) => {
                        this.setState({
                            addEditExportConfigLanguageConfigOpen: false,
                            languageConfigsChanged: [
                                ...this.state.languageConfigsChanged.filter((item) => {
                                    return item.languageId !== exportConfigLanguageConfig.languageId;
                                }),
                                exportConfigLanguageConfig
                            ]
                        });
                    }}
                    onUpdate={async (exportConfigLanguageConfig) => {
                        this.setState({
                            addEditExportConfigLanguageConfigOpen: false,
                            languageConfigsChanged: [
                                ...this.state.languageConfigsChanged.filter((item) => {
                                    return item.languageId !== exportConfigLanguageConfig.languageId;
                                }),
                                exportConfigLanguageConfig
                            ]
                        });
                    }}
                    onCancelRequest={() => {
                        this.setState({
                            addEditExportConfigLanguageConfigOpen: false
                        });
                    }}
                />
            </>
        );
    }
}

export { AddEditExportConfigForm };
