import { Button, Empty, Input, message, Modal, Table } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { useParams } from "react-router";
import { IProject } from "../api/v1/ProjectsAPI";
import { IGetTagsResponse, ITag, TagsAPI } from "../api/v1/TagsAPI";
import { TagFormModal } from "../forms/TagFormModal";
import { dashboardStore } from "../stores/DashboardStore";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { PAGE_SIZE_OPTIONS } from "./Config";

type DATA_INDEX = "name" | "controls";

interface IColumn {
    title: string;
    dataIndex: DATA_INDEX;
    key: string;
    width?: number;
}

type IRow = {
    [k in DATA_INDEX]: React.ReactNode;
};

export function TagsTable(props: { project: IProject; tableReloader?: number; style?: React.CSSProperties }) {
    const params = useParams<{ projectId: string }>();

    const [search, setSearch] = React.useState<string | null>(null);
    const [tagsResponse, setTagsResponse] = React.useState<IGetTagsResponse | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [tagDialogVisible, setTagDialogVisible] = React.useState<boolean>(false);
    const [tagToEdit, setTagToEdit] = React.useState<ITag | null>(null);

    async function reload(options?: { search?: string }) {
        setLoading(true);

        try {
            const response = await TagsAPI.getTags({
                projectId: params.projectId,
                search: options?.search || search
            });
            setTagsResponse(response);
        } catch (error) {
            console.error(error);
            message.error("Failed to load tags.");
        }

        setLoading(false);
    }

    const debouncedSearch = React.useCallback(
        _.debounce((value: string) => {
            reload({ search: value });
        }, 500),
        []
    );

    React.useEffect(() => {
        (async () => {
            await reload();
        })();
    }, [props.tableReloader]);

    function getRows(): IRow[] {
        if (!tagsResponse) {
            return [];
        }

        return tagsResponse.data.map((tag) => {
            return {
                key: tag.attributes.id,
                name: tag.attributes.name,
                controls: (
                    <div style={{ display: "flex" }}>
                        <Button
                            onClick={() => {
                                setTagToEdit(tag);
                                setTagDialogVisible(true);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            danger
                            onClick={() => {
                                Modal.confirm({
                                    title: "Do you really want to delete this tag?",
                                    content: "This cannot be undone.",
                                    okText: "Yes",
                                    okButtonProps: {
                                        danger: true
                                    },
                                    cancelText: "No",
                                    autoFocusButton: "cancel",
                                    onOk: async () => {
                                        setLoading(true);
                                        try {
                                            await TagsAPI.deleteTag({
                                                projectId: props.project.id,
                                                tagId: tag.id
                                            });
                                            message.success("Tag deleted.");
                                        } catch (error) {
                                            console.error(error);
                                            message.error("Failed to delete tag.");
                                        }

                                        setLoading(false);
                                        await reload();
                                    }
                                });
                            }}
                            style={{ marginLeft: 16 }}
                        >
                            Delete
                        </Button>
                    </div>
                )
            };
        }, []);
    }

    function getColumns() {
        const columns: IColumn[] = [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50,
                key: "controls"
            }
        ];

        return columns;
    }

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        setSearch(event.target.value);
        debouncedSearch(event.target.value);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", ...props.style }}>
            <div style={{ display: "flex" }}>
                <div style={{ flexGrow: 1 }}>
                    <Button
                        type="default"
                        style={{ marginRight: 10 }}
                        onClick={() => {
                            setTagDialogVisible(true);
                        }}
                        disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                    >
                        Create tag
                    </Button>
                </div>

                <Input.Search
                    placeholder="Search tags by name"
                    onChange={onSearch}
                    style={{ maxWidth: "50%" }}
                    data-id="tags-search"
                    allowClear
                />
            </div>

            <Table
                style={{ marginTop: 16 }}
                dataSource={getRows()}
                columns={getColumns()}
                bordered
                loading={loading}
                pagination={{
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    total: tagsResponse?.meta?.total || 0
                }}
                locale={{
                    emptyText: <Empty description="No tags found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />

            <TagFormModal
                visible={tagDialogVisible}
                onCancelRequest={() => {
                    setTagDialogVisible(false);
                    setTagToEdit(null);
                }}
                formProps={{
                    projectId: params.projectId,
                    tag: tagToEdit ?? undefined,
                    onSaved: async () => {
                        setTagDialogVisible(false);
                        setTagToEdit(null);
                        await reload();
                    }
                }}
            />
        </div>
    );
}
