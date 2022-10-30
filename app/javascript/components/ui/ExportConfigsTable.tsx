import { Button, Empty, message, Modal, Table, Tooltip } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import * as React from "react";
import { ExportConfigsAPI, IExportConfig, IGetExportConfigsResponse } from "../api/v1/ExportConfigsAPI";
import { IGetLanguagesOptions } from "../api/v1/LanguagesAPI";
import { IProject } from "../api/v1/ProjectsAPI";
import { FileFormatOptions } from "../configs/FileFormatOptions";
import { AddEditExportConfigFormModal } from "../forms/AddEditExportConfigFormModal";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";
import { QuestionIconWithTooltip } from "./QuestionIconWithTooltip";
import { Styles } from "./Styles";

const prettifyFilePath = (path: string) => {
    const splitted = path.split(/({languageCode})|({countryCode})/).filter((splittedPathElement) => {
        return splittedPathElement;
    });

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                fontSize: 14,
                flexWrap: "wrap",
                wordBreak: "break-word"
            }}
        >
            {splitted.map((split, index) => {
                if (split === "{languageCode}") {
                    return (
                        <Tooltip title="This will be automatically replaced with the language code of the language.">
                            <span key={index} style={{ color: Styles.COLOR_SECONDARY }}>
                                {"{languageCode}"}
                            </span>
                        </Tooltip>
                    );
                } else if (split === "{countryCode}") {
                    return (
                        <Tooltip title="This will be automatically replaced with the country code of the language.">
                            <span key={index} style={{ color: Styles.COLOR_SECONDARY }}>
                                {"{countryCode}"}
                            </span>
                        </Tooltip>
                    );
                } else {
                    return <span key={index}>{split}</span>;
                }
            })}
        </div>
    );
};

const getFileFormatName = (fileFormat: string) => {
    return FileFormatOptions.find((fileFormatOption) => {
        return fileFormatOption.value === fileFormat;
    }).text;
};

export function ExportConfigsTable(props: { project: IProject; tableReloader?: number; style?: React.CSSProperties }) {
    const [page, setPage] = React.useState<number>(1);
    const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);
    const [exportConfigToEdit, setExportConfigToEdit] = React.useState<IExportConfig>(null);
    const [exportConfigResponse, setExportConfigResponse] = React.useState<IGetExportConfigsResponse>(null);
    const [exportConfigsLoading, setLanguagesLoading] = React.useState<boolean>(false);
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    async function reload(options?: IGetLanguagesOptions) {
        setLanguagesLoading(true);

        try {
            const newExportConfigsResponse = await ExportConfigsAPI.getExportConfigs({
                projectId: props.project.id,
                options: options
            });
            setExportConfigResponse(newExportConfigsResponse);
        } catch (error) {
            console.error(error);
            message.error("Failed to load export configs.");
        }

        setLanguagesLoading(false);
    }

    React.useEffect(() => {
        (async () => {
            await reload();
        })();
    }, [props.tableReloader]);

    function getRows() {
        if (!exportConfigResponse) {
            return [];
        }

        return exportConfigResponse.data.map((exportConfig) => {
            return {
                key: exportConfig.id,
                name: exportConfig.attributes.name,
                exportConfigId: (
                    <Paragraph code copyable={{ text: exportConfig.id }} style={{ margin: 0, whiteSpace: "nowrap" }}>
                        <Tooltip title={exportConfig.id}>{`${exportConfig.id.substring(0, 8)}...`}</Tooltip>
                    </Paragraph>
                ),
                fileFormat: (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {getFileFormatName(exportConfig.attributes.file_format)}
                        {exportConfig.attributes.file_format === "json" && exportConfig.attributes.split_on && (
                            <div style={{ marginTop: 16 }}>
                                <h4 style={{ fontWeight: "bold" }}>Split keys on:</h4>
                                {exportConfig.attributes.split_on}
                            </div>
                        )}
                        {exportConfig.relationships.language_configs.data.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <h4 style={{ fontWeight: "bold" }}>Number of language configs:</h4>
                                {exportConfig.relationships.language_configs.data.length}
                            </div>
                        )}
                    </div>
                ),
                filePath: prettifyFilePath(exportConfig.attributes.file_path),
                defaultLanguageFilePath: exportConfig.attributes.default_language_file_path,
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Button
                            onClick={() => {
                                setExportConfigToEdit(exportConfig);
                                setDialogVisible(true);
                            }}
                        >
                            Edit
                        </Button>
                    </div>
                )
            };
        }, []);
    }

    function getColumns() {
        const columns: { title: React.ReactNode; dataIndex: string; key?: string; width?: number }[] = [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "ID",
                dataIndex: "exportConfigId",
                key: "exportConfigId"
            },
            {
                title: "File format",
                dataIndex: "fileFormat",
                key: "fileFormat"
            },
            {
                title: (
                    <>
                        File path
                        <QuestionIconWithTooltip
                            tooltip="The folder and name of your language translation files."
                            style={{ marginLeft: 8 }}
                        />
                    </>
                ),
                dataIndex: "filePath",
                key: "filePath"
            },
            {
                title: (
                    <>
                        Default language file path
                        <QuestionIconWithTooltip
                            tooltip="Overwrite the folder and name for your default language. If not set the normal file path will be used. Overwriting can be useful if the default language needs special treatment (e.g. Android)."
                            style={{ marginLeft: 8 }}
                        />
                    </>
                ),
                dataIndex: "defaultLanguageFilePath",
                key: "defaultLanguageFilePath"
            }
        ];

        if (PermissionUtils.isDeveloperOrHigher(props.project.attributes.current_user_role)) {
            columns.push({
                title: "",
                dataIndex: "controls",
                width: 50
            });
        }

        return columns;
    }

    async function onDelete() {
        setIsDeleting(true);
        Modal.confirm({
            title: "Do you really want to delete the selected export configs?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: isDeleting,
            onOk: async () => {
                try {
                    const response = await ExportConfigsAPI.deleteExportConfigs({
                        projectId: props.project.id,
                        exportConfigIds: selectedRowKeys as string[]
                    });
                    if (response.errors) {
                        message.error("Failed to delete export config.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to delete export config.");
                    console.error(error);
                }

                await reload();

                setIsDeleting(false);
                setSelectedRowKeys([]);
            },
            onCancel: () => {
                setIsDeleting(false);
            }
        });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div style={{ display: "flex", marginBottom: 24 }}>
                <Button
                    onClick={() => {
                        setDialogVisible(true);
                    }}
                    data-id="export-configs-table-new-button"
                >
                    Create new
                </Button>
                <Button
                    danger
                    onClick={onDelete}
                    disabled={
                        selectedRowKeys.length === 0 ||
                        !PermissionUtils.isDeveloperOrHigher(props.project.attributes.current_user_role)
                    }
                    loading={isDeleting}
                    style={{ marginLeft: 8 }}
                >
                    Delete selected
                </Button>
            </div>
            <Table
                style={props.style}
                rowSelection={{
                    onChange: (newSelectedRowKeys) => {
                        setSelectedRowKeys(newSelectedRowKeys);
                    },
                    getCheckboxProps: () => {
                        return {
                            disabled: !PermissionUtils.isDeveloperOrHigher(props.project.attributes.current_user_role)
                        };
                    }
                }}
                dataSource={getRows()}
                columns={getColumns()}
                bordered
                loading={exportConfigsLoading}
                pagination={{
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    current: page,
                    pageSize: perPage,
                    total: exportConfigResponse?.meta?.total || 0,
                    onChange: async (newPage, newPerPage) => {
                        const isPageSizeChange = perPage !== newPerPage;

                        if (isPageSizeChange) {
                            setPage(1);
                            setPerPage(newPerPage);
                            reload({ page: 1, perPage: newPerPage });
                        } else {
                            setPage(newPage);
                            reload({ page: newPage });
                        }
                    }
                }}
                locale={{
                    emptyText: <Empty description="No export configs found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />

            <AddEditExportConfigFormModal
                visible={dialogVisible}
                formProps={{
                    projectId: props.project.id,
                    exportConfigToEdit: exportConfigToEdit,
                    onSaved: async () => {
                        setDialogVisible(false);
                        setExportConfigToEdit(null);
                        await reload();
                    }
                }}
                onCancelRequest={async () => {
                    setDialogVisible(false);
                    setExportConfigToEdit(null);
                }}
            />
        </div>
    );
}
