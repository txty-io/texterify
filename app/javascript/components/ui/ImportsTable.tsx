import { CheckCircleFilled, LoadingOutlined, QuestionCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Empty, message, Modal, Table, Tooltip } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { APIUtils } from "../api/v1/APIUtils";
import { IGetImportResponse, IGetImportsOptions, IGetImportsResponse, ImportsAPI } from "../api/v1/ImportsAPI";
import { IUser } from "../api/v1/OrganizationMembersAPI";
import { IProject } from "../api/v1/ProjectsAPI";
import { Routes } from "../routing/Routes";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";
import { Utils } from "./Utils";

function ImportStatus(props: { status: IGetImportResponse["data"]["attributes"]["status"] }) {
    let statusContent;

    if (props.status === "CREATED") {
        statusContent = (
            <span style={{ color: "var(--color-golden)" }}>
                Please specify formats and languages
                <Tooltip title="Please specify the correspondig languages and formats of your uploaded files.">
                    <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
            </span>
        );
    } else if (props.status === "VERIFYING") {
        statusContent = (
            <>
                <LoadingOutlined style={{ marginRight: 16 }} />
                {props.status}
            </>
        );
    } else if (props.status === "VERIFIED") {
        statusContent = (
            <span style={{ color: "var(--color-golden)" }}>
                Review changes before import
                <Tooltip title="Review the translation changes of your upload before importing them.">
                    <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                </Tooltip>
            </span>
        );
    } else if (props.status === "IMPORTING") {
        statusContent = (
            <>
                <LoadingOutlined style={{ marginRight: 16 }} />
                Importing...
            </>
        );
    } else if (props.status === "IMPORTED") {
        statusContent = (
            <span style={{ color: "var(--color-success)" }}>
                <CheckCircleFilled style={{ marginRight: 8 }} />
                Imported
            </span>
        );
    } else if (props.status === "ERROR") {
        statusContent = (
            <span style={{ color: "var(--color-error)" }}>
                <WarningOutlined style={{ marginRight: 8 }} />
                Import failed
            </span>
        );
    } else {
        statusContent = props.status;
    }

    return <span style={{ whiteSpace: "nowrap" }}>{statusContent}</span>;
}

export function ImportsTable(props: { project: IProject; tableReloader?: number; style?: React.CSSProperties }) {
    const [page, setPage] = React.useState<number>(1);
    const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const [importsResponse, setImportsResponse] = React.useState<IGetImportsResponse>(null);
    const [importsLoading, setImportsLoading] = React.useState<boolean>(false);
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);

    async function reload(options?: Omit<IGetImportsOptions, "projectId">) {
        setImportsLoading(true);

        try {
            const newImportsResponse = await ImportsAPI.get({
                projectId: props.project.id,
                ...options
            });
            if (newImportsResponse.data) {
                setImportsResponse(newImportsResponse);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load imports.");
        }

        setImportsLoading(false);
    }

    React.useEffect(() => {
        (async () => {
            await reload();
        })();
    }, [props.tableReloader]);

    function getRows() {
        if (!importsResponse) {
            return [];
        }

        return importsResponse.data.map((imp) => {
            const user: IUser = APIUtils.getIncludedObject(imp.relationships.user.data, importsResponse.included);

            return {
                key: imp.id,
                id: imp.attributes.id,
                name: (
                    <Link
                        to={Routes.DASHBOARD.PROJECT_IMPORTS_DETAILS_RESOLVER({
                            projectId: props.project.id,
                            importId: imp.attributes.id
                        })}
                    >
                        {imp.attributes.name}
                    </Link>
                ),
                user: user?.attributes.username,
                importedAt: Utils.formatDateTime(imp.attributes.created_at),
                status: <ImportStatus status={imp.attributes.status} />
            };
        });
    }

    function getColumns() {
        const columns: { title: React.ReactNode; dataIndex: string; key?: string; width?: number }[] = [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status"
            },
            {
                title: "Imported at",
                dataIndex: "importedAt",
                key: "importedAt"
            },
            {
                title: "Uploaded by",
                dataIndex: "user",
                key: "user"
            }
        ];

        // if (PermissionUtils.isDeveloperOrHigher(props.project.attributes.current_user_role)) {
        //     columns.push({
        //         title: "",
        //         dataIndex: "controls",
        //         width: 50
        //     });
        // }

        return columns;
    }

    async function onDelete() {
        setIsDeleting(true);
        Modal.confirm({
            title: "Do you really want to delete the selected imports?",
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
                    const response = await ImportsAPI.delete({
                        projectId: props.project.id,
                        importIds: selectedRowKeys as string[]
                    });
                    if (response.errors) {
                        message.error("Failed to delete import.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to delete import.");
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
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, ...props.style }}>
            <div style={{ display: "flex", marginBottom: 24 }}>
                <Button
                    danger
                    onClick={onDelete}
                    disabled={
                        selectedRowKeys.length === 0 ||
                        !PermissionUtils.isDeveloperOrHigher(props.project.attributes.current_user_role)
                    }
                    loading={isDeleting}
                >
                    Delete selected
                </Button>
            </div>
            <Table
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
                loading={importsLoading}
                pagination={{
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    current: page,
                    pageSize: perPage,
                    total: importsResponse?.meta?.total || 0,
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
                    emptyText: <Empty description="No imports found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />
        </div>
    );
}
