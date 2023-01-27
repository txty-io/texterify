import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Checkbox, Empty, Form, Input, Modal, Select, Table } from "antd";
import { FormInstance } from "antd/lib/form";
import Paragraph from "antd/lib/typography/Paragraph";
import * as React from "react";
import { useQuery } from "react-query";
import { APIUtils } from "../api/v1/APIUtils";
import { ExportConfigsAPI, IExportConfig } from "../api/v1/ExportConfigsAPI";
import { FileFormatsAPI } from "../api/v1/FileFormatsAPI";
import { LanguageConfigsAPI } from "../api/v1/LanguageConfigsAPI";
import useFlavors from "../hooks/useFlavors";
import useLanguageConfigs from "../hooks/useLanguageConfigs";
import useLanguages from "../hooks/useLanguages";
import { CountryCodeWithTooltip } from "../ui/CountryCodeWithTooltip";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";
import FlagIcon from "../ui/FlagIcons";
import { LanguageCodeWithTooltip } from "../ui/LanguageCodeWithTooltip";
import { AddEditExportConfigLanguageForm, ICreateUpdateLanguageConfig } from "./AddEditExportConfigLanguageForm";

interface IFormValues {
    name: string;
    fileFormatId: string;
    flavorId: string;
    filePath: string;
    filePathStringsdict: string;
    defaultLanguageFilePath: string;
    defaultLanguageFilePathStringsdict: string;
    splitOn: string;
    skipEmptyPluralTranslations: boolean;
}

export interface IAddEditExportConfigFormProps {
    exportConfigToEdit?: IExportConfig;
    projectId: string;
    hideDefaultSubmitButton?: boolean;
    clearFieldsAfterSubmit?: boolean;
    formId?: string;
    onSaved?(): void;
    onLanguageConfigDeleted?(): void;
}

export function AddEditExportConfigForm(props: IAddEditExportConfigFormProps) {
    const formRef = React.createRef<FormInstance>();

    const [languageConfigsToCreate, setLanguageConfigsToCreate] = React.useState<ICreateUpdateLanguageConfig[]>([]);
    const [selectedFileFormatId, setSelectedFileFormatId] = React.useState<string | undefined>(
        props.exportConfigToEdit?.attributes.file_format_id
    );
    const [addEditExportConfigLanguageConfigOpen, setAddEditExportConfigLanguageConfigOpen] =
        React.useState<boolean>(false);
    const [exportConfigLanguageConfigToEdit, setExportConfigLanguageConfigToEdit] =
        React.useState<ICreateUpdateLanguageConfig | undefined>(undefined);
    const [flavorSearch, setFlavorSearch] = React.useState<string>("");

    const { languagesResponse, languagesLoading } = useLanguages(props.projectId, {
        showAll: true
    });
    const { flavorsResponse, flavorsLoading } = useFlavors(props.projectId, { search: flavorSearch });
    const { languageConfigsResponse, languageConfigsLoading, languageConfigsForceReload } = useLanguageConfigs({
        options: {
            projectId: props.projectId,
            exportConfigId: props.exportConfigToEdit?.id
        }
    });

    const { data: fileFormatsData } = useQuery("fileFormats", async ({ signal }) => {
        const response = await FileFormatsAPI.getFileFormats({ signal });
        return response.data;
    });

    const handleSubmit = async (values: IFormValues) => {
        let response;

        if (props.exportConfigToEdit) {
            response = await ExportConfigsAPI.updateExportConfig({
                projectId: props.projectId,
                defaultLanguageFilePath: values.defaultLanguageFilePath,
                defaultLanguageFilePathStringsdict: values.defaultLanguageFilePathStringsdict,
                fileFormatId: values.fileFormatId,
                exportConfigId: props.exportConfigToEdit.id,
                flavorId: values.flavorId,
                filePath: values.filePath,
                filePathStringsdict: values.filePathStringsdict,
                name: values.name,
                splitOn: values.splitOn,
                skipEmptyPluralTranslations: values.skipEmptyPluralTranslations
            });
        } else {
            response = await ExportConfigsAPI.createExportConfig({
                projectId: props.projectId,
                defaultLanguageFilePath: values.defaultLanguageFilePath,
                defaultLanguageFilePathStringsdict: values.defaultLanguageFilePathStringsdict,
                fileFormatId: values.fileFormatId,
                flavorId: values.flavorId,
                filePath: values.filePath,
                filePathStringsdict: values.filePathStringsdict,
                name: values.name,
                splitOn: values.splitOn,
                skipEmptyPluralTranslations: values.skipEmptyPluralTranslations
            });
        }

        if (response.errors) {
            if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                formRef.current?.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
                    }
                ]);
            } else {
                ErrorUtils.showErrors(response.errors);
            }
        } else {
            for (const changedLanguageConfig of languageConfigsToCreate) {
                await LanguageConfigsAPI.createLanguageConfig({
                    projectId: props.projectId,
                    exportConfigId: response.data.id,
                    languageId: changedLanguageConfig.languageId,
                    languageCode: changedLanguageConfig.languageCode
                });
            }

            if (props.onSaved) {
                props.onSaved();
            }

            if (props.clearFieldsAfterSubmit) {
                formRef.current?.resetFields();
            }
        }
    };

    const onDelete = async (createUpdateLanguageConfig: ICreateUpdateLanguageConfig) => {
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
                        projectId: props.projectId,
                        exportConfigId: props.exportConfigToEdit.id,
                        languageConfigId: createUpdateLanguageConfig.id
                    });

                    await languageConfigsForceReload();
                    props.onLanguageConfigDeleted();
                } else {
                    setLanguageConfigsToCreate(
                        languageConfigsToCreate.filter((item) => {
                            return item.languageId !== createUpdateLanguageConfig.languageId;
                        })
                    );
                }
            }
        });
    };

    const getRows = () => {
        if (languagesLoading || languageConfigsLoading) {
            return [];
        }

        const existingLanguageConfigs =
            languageConfigsResponse?.data
                .filter((languageConfig) => {
                    return !languageConfigsToCreate.find((languageConfigToCreate) => {
                        return languageConfig.attributes.language_id === languageConfigToCreate.languageId;
                    });
                })
                .map((languageConfig) => {
                    const language = languagesResponse?.data.find((languageToFind) => {
                        return languageConfig.attributes.language_id === languageToFind.id;
                    });

                    const countryCode = APIUtils.getIncludedObject(
                        language?.relationships.country_code.data,
                        languagesResponse.included
                    );

                    return {
                        id: languageConfig.id,
                        languageId: languageConfig.attributes.language_id,
                        languageCode: languageConfig.attributes.language_code,
                        languageName: language?.attributes.name,
                        countryCode: countryCode?.attributes.code.toLowerCase()
                    };
                }) || [];

        return [...languageConfigsToCreate, ...existingLanguageConfigs]
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
                                    setAddEditExportConfigLanguageConfigOpen(true);
                                    setExportConfigLanguageConfigToEdit(item);
                                }}
                                type="link"
                            >
                                <EditOutlined />
                            </Button>
                            <Button
                                onClick={() => {
                                    onDelete(item);
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

    const getColumns = () => {
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

    const selectedFileFormat = fileFormatsData?.data.find(
        (fileFormat) => fileFormat.attributes.id === selectedFileFormatId
    );

    return (
        <>
            <Form
                ref={formRef}
                onFinish={handleSubmit}
                id={props.formId}
                initialValues={
                    props.exportConfigToEdit &&
                    ({
                        name: props.exportConfigToEdit.attributes.name,
                        splitOn: props.exportConfigToEdit.attributes.split_on,
                        flavorId: props.exportConfigToEdit.attributes.flavor_id,
                        filePath: props.exportConfigToEdit.attributes.file_path,
                        filePathStringsdict: props.exportConfigToEdit.attributes.file_path_stringsdict,
                        defaultLanguageFilePath: props.exportConfigToEdit.attributes.default_language_file_path,
                        defaultLanguageFilePathStringsdict:
                            props.exportConfigToEdit.attributes.default_language_file_path_stringsdict,
                        skipEmptyPluralTranslations: props.exportConfigToEdit.attributes.skip_empty_plural_translations,
                        fileFormatId: props.exportConfigToEdit.attributes.file_format_id
                    } as IFormValues)
                }
                onValuesChange={(changedValues: IFormValues) => {
                    if (changedValues.fileFormatId) {
                        setSelectedFileFormatId(changedValues.fileFormatId);
                    }
                }}
                style={{ display: "flex" }}
            >
                <div style={{ width: "50%", marginRight: 40 }}>
                    <h3>Name *</h3>
                    <Form.Item
                        name="name"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: "Please enter the name of the export config."
                            }
                        ]}
                    >
                        <Input placeholder="Name" autoFocus />
                    </Form.Item>

                    <h3>File format *</h3>
                    <Form.Item
                        name="fileFormatId"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: "Please enter the file format of the files."
                            }
                        ]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a file format"
                            optionFilterProp="children"
                            filterOption
                            style={{ width: "100%" }}
                        >
                            {fileFormatsData?.data
                                .filter((fileFormat) => fileFormat.attributes.export_support)
                                .map((fileFormat) => {
                                    return (
                                        <Select.Option value={fileFormat.id} key={fileFormat.id}>
                                            {fileFormat.attributes.name}
                                        </Select.Option>
                                    );
                                })}
                        </Select>
                    </Form.Item>

                    {selectedFileFormat?.attributes.format === "json" && (
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

                    {selectedFileFormat?.attributes.skip_empty_plural_translations_support && (
                        <>
                            <h3>Skip empty plural translations</h3>
                            <p>
                                Activating this option will not export empty plural translation except of the{" "}
                                <code>other</code> form which is always required.
                            </p>
                            <Form.Item
                                name="skipEmptyPluralTranslations"
                                rules={[{ required: false }]}
                                valuePropName="checked"
                            >
                                <Checkbox>Skip empty plural translations</Checkbox>
                            </Form.Item>
                        </>
                    )}

                    <h3>File path *</h3>
                    <p>The file path specifies where files are placed in the exported folder.</p>

                    <p>You can make use of the following variables to create dynamic paths:</p>
                    <div style={{ display: "flex" }}>
                        <Paragraph code copyable={{ text: "{languageCode}" }} style={{ marginRight: 24 }}>
                            <LanguageCodeWithTooltip />
                        </Paragraph>
                        <Paragraph code copyable={{ text: "{countryCode}" }}>
                            <CountryCodeWithTooltip />
                        </Paragraph>
                    </div>
                    <Form.Item
                        name="filePath"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: "Please enter the file path of the files."
                            }
                        ]}
                    >
                        <Input placeholder="File path" />
                    </Form.Item>
                    {selectedFileFormat?.attributes.format === "ios" && (
                        <Form.Item
                            name="filePathStringsdict"
                            rules={[
                                {
                                    required: false,
                                    whitespace: true,
                                    message: "Please enter the file path of the stringsdict files."
                                }
                            ]}
                        >
                            <Input placeholder="File path for stringsdict file" />
                        </Form.Item>
                    )}

                    <h3>Default language file path</h3>
                    <p>A special file path for the default language if available.</p>
                    <Form.Item name="defaultLanguageFilePath" rules={[]}>
                        <Input placeholder="Default language file path" />
                    </Form.Item>
                    {selectedFileFormat?.attributes.format === "ios" && (
                        <Form.Item name="defaultLanguageFilePathStringsdict" rules={[]}>
                            <Input placeholder="Default language file path for stringsdict file" />
                        </Form.Item>
                    )}
                </div>
                <div style={{ width: "50%" }}>
                    <h3>Flavor</h3>
                    <p>Setting a flavor will make the export config use the flavor translations.</p>
                    <Form.Item name="flavorId">
                        <Select
                            showSearch
                            placeholder="Select a flavor"
                            optionFilterProp="children"
                            filterOption
                            style={{ width: "100%" }}
                            loading={flavorsLoading}
                            onSearch={(value) => {
                                setFlavorSearch(value);
                            }}
                        >
                            {flavorsResponse?.data?.map((flavor, index) => {
                                return (
                                    <Select.Option value={flavor.id} key={index}>
                                        {flavor.attributes.name}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    <h3>Override language codes</h3>
                    <p>Override the language codes used for exports in this configuration.</p>
                    <div style={{ display: "flex" }}>
                        <Button
                            style={{ marginTop: 8, marginLeft: "auto" }}
                            onClick={() => {
                                setAddEditExportConfigLanguageConfigOpen(true);
                            }}
                        >
                            Add new language code override
                        </Button>
                    </div>
                    <Table
                        dataSource={getRows()}
                        columns={getColumns()}
                        style={{ marginTop: 16 }}
                        bordered
                        pagination={false}
                        loading={languageConfigsLoading || languagesLoading}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No language code overrides found"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                    />
                    {!props.hideDefaultSubmitButton && (
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ marginLeft: "auto", marginTop: 24 }}
                            data-id="export-config-form-submit-button"
                        >
                            {props.exportConfigToEdit ? "Save changes" : "Add export config"}
                        </Button>
                    )}
                </div>
            </Form>

            <AddEditExportConfigLanguageForm
                languagesResponse={languagesResponse}
                languageConfigsResponse={languageConfigsResponse}
                projectId={props.projectId}
                languageConfigsToCreate={languageConfigsToCreate}
                exportConfigLanguageConfigToEdit={exportConfigLanguageConfigToEdit}
                visible={addEditExportConfigLanguageConfigOpen}
                onCreate={async (exportConfigLanguageConfig) => {
                    if (props.exportConfigToEdit) {
                        await LanguageConfigsAPI.createLanguageConfig({
                            projectId: props.projectId,
                            exportConfigId: props.exportConfigToEdit.id,
                            languageId: exportConfigLanguageConfig.languageId,
                            languageCode: exportConfigLanguageConfig.languageCode
                        });

                        await languageConfigsForceReload();
                    } else {
                        setLanguageConfigsToCreate([
                            ...languageConfigsToCreate.filter((item) => {
                                return item.languageId !== exportConfigLanguageConfig.languageId;
                            }),
                            exportConfigLanguageConfig
                        ]);
                    }
                    setAddEditExportConfigLanguageConfigOpen(false);
                }}
                onUpdate={async (exportConfigLanguageConfig) => {
                    if (props.exportConfigToEdit) {
                        await LanguageConfigsAPI.updateLanguageConfig({
                            projectId: props.projectId,
                            exportConfigId: props.exportConfigToEdit.id,
                            languageConfigId: exportConfigLanguageConfig.id,
                            languageCode: exportConfigLanguageConfig.languageCode,
                            languageId: exportConfigLanguageConfig.languageId
                        });

                        await languageConfigsForceReload();
                    } else {
                        setLanguageConfigsToCreate([
                            ...languageConfigsToCreate.filter((item) => {
                                return item.languageId !== exportConfigLanguageConfig.languageId;
                            }),
                            exportConfigLanguageConfig
                        ]);
                    }

                    setAddEditExportConfigLanguageConfigOpen(false);
                }}
                onCancelRequest={() => {
                    setAddEditExportConfigLanguageConfigOpen(false);
                    setExportConfigLanguageConfigToEdit(null);
                }}
            />
        </>
    );
}
