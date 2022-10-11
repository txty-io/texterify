import { Button, Empty, Input, message, Modal, Table } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { useParams } from "react-router";
import { IProject } from "../api/v1/ProjectsAPI";
import { IGetTagsResponse, ITag, TagsAPI } from "../api/v1/TagsAPI";
import { TagFormModal } from "../forms/TagFormModal";
import { dashboardStore } from "../stores/DashboardStore";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";
import { DeleteLink } from "./DeleteLink";

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

interface IReloadOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

export function TagsTable(props: { project: IProject; tableReloader?: number; style?: React.CSSProperties }) {
    const params = useParams<{ projectId: string }>();

    const [page, setPage] = React.useState<number>(1);
    const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = React.useState<string>(null);
    const [tagsResponse, setTagsResponse] = React.useState<IGetTagsResponse>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [tagDialogVisible, setTagDialogVisible] = React.useState<boolean>(false);
    const [tagToEdit, setTagToEdit] = React.useState<ITag>(null);

    async function reload(options?: IReloadOptions) {
        setLoading(true);

        try {
            const response = await TagsAPI.getTags({
                projectId: params.projectId,
                search: options?.search || search,
                page: options?.page || page,
                perPage: options?.perPage || perPage
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
            reload({ search: value, page: 1 });
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
                                        setPage(1);
                                        await reload({ page: 1 });
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
                    current: page,
                    pageSize: perPage,
                    total: tagsResponse?.meta?.total || 0,
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
                    tag: tagToEdit,
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
