import { CrownOutlined } from "@ant-design/icons";
import { Button, Empty, message, Modal, Table } from "antd";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { IGetLanguagesOptions, IGetLanguagesResponse, ILanguage, LanguagesAPI } from "../api/v1/LanguagesAPI";
import { IProject } from "../api/v1/ProjectsAPI";
import { AddEditLanguageFormModal } from "../forms/AddEditLanguageFormModal";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";
import FlagIcon from "./FlagIcons";

export function LanguagesTable(props: { project: IProject; tableReloader?: number; style?: React.CSSProperties }) {
    const [page, setPage] = React.useState<number>(1);
    const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);
    const [languageToEdit, setLanguageToEdit] = React.useState<ILanguage>(null);
    const [languagesResponse, setLanguagesResponse] = React.useState<IGetLanguagesResponse>(null);
    const [languagesLoading, setLanguagesLoading] = React.useState<boolean>(false);
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    async function reload(options?: IGetLanguagesOptions) {
        setLanguagesLoading(true);

        try {
            const newLanguagesResponse = await LanguagesAPI.getLanguages(props.project.id, {
                page: options?.page || page,
                perPage: options?.perPage || perPage
            });
            setLanguagesResponse(newLanguagesResponse);
        } catch (error) {
            console.error(error);
            message.error("Failed to load languages.");
        }

        setLanguagesLoading(false);
    }

    React.useEffect(() => {
        (async () => {
            await reload();
        })();
    }, [props.tableReloader]);

    function getRows() {
        if (!languagesResponse) {
            return [];
        }

        return languagesResponse.data.map((language) => {
            const countryCode = APIUtils.getIncludedObject(
                language.relationships.country_code.data,
                languagesResponse.included
            );

            const languageCode = APIUtils.getIncludedObject(
                language.relationships.language_code.data,
                languagesResponse.included
            );

            return {
                key: language.attributes.id,
                default: language.attributes.is_default ? (
                    <div style={{ textAlign: "center" }}>
                        <CrownOutlined style={{ color: "#d6ad13", fontSize: 16 }} />
                    </div>
                ) : null,
                name: language.attributes.name,
                countryCode: countryCode ? (
                    <span>
                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                        <span style={{ marginLeft: 8 }}>{countryCode.attributes.code}</span>
                    </span>
                ) : (
                    ""
                ),
                languageCode: languageCode ? languageCode.attributes.code : "",
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Button
                            onClick={() => {
                                setLanguageToEdit(language);
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
        const columns: { title: string; dataIndex: string; key?: string; width?: number }[] = [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
                // defaultSortOrder: "ascend",
                // sorter: (a, b) => {
                //     return sortStrings(a.name, b.name, true);
                // }
            },
            {
                title: "Default",
                dataIndex: "default",
                key: "default",
                width: 40
            },
            {
                title: "Country code",
                dataIndex: "countryCode",
                key: "countryCode",
                width: 160
            },
            {
                title: "Language code",
                dataIndex: "languageCode",
                key: "languageCode",
                width: 160
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

    async function onDeleteLanguages() {
        setIsDeleting(true);
        Modal.confirm({
            title: "Do you really want to delete the selected languages?",
            content: "This cannot be undone and all translations for this languages will also be deleted.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: isDeleting,
            onOk: async () => {
                try {
                    const response = await LanguagesAPI.deleteLanguages(props.project.id, selectedRowKeys);
                    if (response.errors) {
                        message.error("Failed to delete languages.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to delete languages.");
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
            <Button
                danger
                onClick={onDeleteLanguages}
                disabled={
                    selectedRowKeys.length === 0 ||
                    !PermissionUtils.isDeveloperOrHigher(props.project.attributes.current_user_role)
                }
                loading={isDeleting}
                style={{ marginBottom: 24, alignSelf: "flex-start" }}
            >
                Delete selected
            </Button>
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
                loading={languagesLoading}
                pagination={{
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    current: page,
                    pageSize: perPage,
                    total: languagesResponse?.meta.total || 0,
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
                    emptyText: <Empty description="No languages found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />

            <AddEditLanguageFormModal
                visible={dialogVisible}
                onCancelRequest={() => {
                    setDialogVisible(false);
                    setLanguageToEdit(null);
                }}
                languageFormProps={{
                    projectId: props.project.id,
                    languageToEdit: languageToEdit,

                    onCreated: async () => {
                        setDialogVisible(false);
                        setLanguageToEdit(null);
                        reload();
                    }
                }}
            />
        </div>
    );
}
