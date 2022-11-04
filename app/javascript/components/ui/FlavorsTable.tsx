import { Button, Empty, message, Modal, Table, Tooltip } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import * as React from "react";
import { FlavorsAPI, IFlavor } from "../api/v1/FlavorsAPI";
import { IProject } from "../api/v1/ProjectsAPI";
import { AddEditFlavorFormModal } from "../forms/AddEditFlavorFormModal";
import useFlavors from "../hooks/useFlavors";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";

export function FlavorsTable(props: { project: IProject; tableReloader?: number; style?: React.CSSProperties }) {
    const [page, setPage] = React.useState<number>(1);
    const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const [dialogVisible, setDialogVisible] = React.useState<boolean>(false);
    const [flavorToEdit, setFlavorToEdit] = React.useState<IFlavor>(null);
    const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
    const { flavorsResponse, flavorsLoading, flavorsForceReload } = useFlavors(props.project.id, {
        page: page,
        perPage: perPage
    });

    React.useEffect(() => {
        (async () => {
            await flavorsForceReload();
        })();
    }, [props.tableReloader]);

    function getRows() {
        if (!flavorsResponse || !flavorsResponse.data) {
            return [];
        }

        return flavorsResponse.data.map((flavor) => {
            return {
                key: flavor.id,
                name: flavor.attributes.name,
                flavorId: (
                    <Paragraph code copyable={{ text: flavor.id }} style={{ margin: 0, whiteSpace: "nowrap" }}>
                        <Tooltip title={flavor.id}>{flavor.id}</Tooltip>
                    </Paragraph>
                ),
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Button
                            onClick={() => {
                                setFlavorToEdit(flavor);
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
                dataIndex: "flavorId",
                key: "flavorId"
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
            title: "Do you really want to delete the selected flavors?",
            content: "This cannot be undone. All translations that belong to this flavor will also be deleted.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: isDeleting,
            onOk: async () => {
                try {
                    const response = await FlavorsAPI.deleteFlavors({
                        projectId: props.project.id,
                        flavorIds: selectedRowKeys as string[]
                    });
                    if (response.errors) {
                        message.error("Failed to delete flavor.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to delete flavor.");
                    console.error(error);
                }

                await flavorsForceReload();

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
                    data-id="flavors-table-new-button"
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
                loading={flavorsLoading}
                pagination={{
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    current: page,
                    pageSize: perPage,
                    total: flavorsResponse?.meta?.total || 0,
                    onChange: async (newPage, newPerPage) => {
                        const isPageSizeChange = perPage !== newPerPage;

                        if (isPageSizeChange) {
                            setPage(1);
                            setPerPage(newPerPage);
                        } else {
                            setPage(newPage);
                        }
                    }
                }}
                locale={{
                    emptyText: <Empty description="No flavors found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />

            <AddEditFlavorFormModal
                visible={dialogVisible}
                formProps={{
                    projectId: props.project.id,
                    flavorToEdit: flavorToEdit,
                    onSaved: async () => {
                        setDialogVisible(false);
                        setFlavorToEdit(null);
                        await flavorsForceReload();
                    }
                }}
                onCancelRequest={async () => {
                    setDialogVisible(false);
                    setFlavorToEdit(null);
                }}
            />
        </div>
    );
}
