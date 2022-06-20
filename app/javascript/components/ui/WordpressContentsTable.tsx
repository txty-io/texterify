import { Button, Empty, message, Table } from "antd";
import * as moment from "moment";
import * as React from "react";
import {
    IGetWordpressContentsResponse,
    WordpressPolylangConnectionsAPI
} from "../api/v1/WordpressPolylangConnectionsAPI";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";
import { DATE_TIME_FORMAT } from "./Utils";

export function WordpressContentsTable(props: {
    projectId: string;
    tableReloader?: number;
    style?: React.CSSProperties;
}) {
    const [page, setPage] = React.useState<number>(1);
    const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
    const [wordpressContentsResponse, setWordpressContentsResponse] =
        React.useState<IGetWordpressContentsResponse>(null);
    const [wordpressContentsLoading, setWordpressContentsLoading] = React.useState<boolean>(false);
    const [importingContent, setImportingContent] = React.useState<boolean>(false);

    async function reload(options?: any) {
        setWordpressContentsLoading(true);

        try {
            const response = await WordpressPolylangConnectionsAPI.getWordpressContent({ projectId: props.projectId });
            setWordpressContentsResponse(response);
        } catch (error) {
            console.error(error);
            message.error("Failed to load WordPress content.");
        }

        setWordpressContentsLoading(false);
    }

    React.useEffect(() => {
        (async () => {
            await reload();
        })();
    }, [props.tableReloader]);

    function getRows() {
        if (!wordpressContentsResponse || !wordpressContentsResponse.data) {
            return [];
        }

        return wordpressContentsResponse.data.map((wordpressContent) => {
            return {
                key: wordpressContent.attributes.id,
                title: wordpressContent.attributes.wordpress_title,
                status: wordpressContent.attributes.wordpress_status,
                content_type: wordpressContent.attributes.wordpress_content_type,
                type: wordpressContent.attributes.wordpress_type,
                changed_at: moment(wordpressContent.attributes.wordpress_modified).format(DATE_TIME_FORMAT)
            };
        }, []);
    }

    function getColumns() {
        const columns: { title: string; dataIndex: string; key?: string; width?: number }[] = [
            {
                title: "Title",
                dataIndex: "title",
                key: "title"
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status"
            },
            {
                title: "Content type",
                dataIndex: "content_type",
                key: "content_type"
            },
            {
                title: "Type",
                dataIndex: "type",
                key: "type"
            },
            {
                title: "Changed at",
                dataIndex: "changed_at",
                key: "changed_at"
            }
        ];

        return columns;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, alignContent: "flex-start" }}>
            <div style={{ display: "flex", margin: "8px 0" }}>
                <Button
                    onClick={async () => {
                        setWordpressContentsLoading(true);
                        try {
                            const pullResponse = await WordpressPolylangConnectionsAPI.pullWordpressContent({
                                projectId: props.projectId
                            });

                            if (pullResponse.error) {
                                if (pullResponse.message === "CONNECTION_SETTINGS_NOT_COMPLETE") {
                                    message.error(
                                        "Setup for WordPress integration not complete. Please check your integration settings."
                                    );
                                }
                            } else {
                                const response = await WordpressPolylangConnectionsAPI.getWordpressContent({
                                    projectId: props.projectId
                                });
                                setWordpressContentsResponse(response);
                            }
                        } catch (error) {
                            console.error();
                        }
                        setWordpressContentsLoading(false);
                    }}
                    type="primary"
                    style={{ alignSelf: "flex-start" }}
                    loading={wordpressContentsLoading}
                >
                    Reload WordPress content
                </Button>

                <Button
                    onClick={async () => {
                        setWordpressContentsLoading(true);
                        try {
                            const response = await WordpressPolylangConnectionsAPI.pushWordpressContent({
                                projectId: props.projectId
                            });

                            if (response.error) {
                                if (response.message === "CONNECTION_SETTINGS_NOT_COMPLETE") {
                                    message.error(
                                        "Setup for WordPress integration not complete. Please check your integration settings."
                                    );
                                }
                            }
                        } catch (error) {
                            console.error();
                        }
                        setWordpressContentsLoading(false);
                    }}
                    type="primary"
                    style={{ alignSelf: "flex-start", marginLeft: 8 }}
                    loading={wordpressContentsLoading}
                >
                    Push imported content to WordPress
                </Button>
            </div>

            <h3 style={{ marginTop: 24 }}>Select content to import</h3>
            <Table
                style={props.style}
                rowSelection={{
                    onChange: (newSelectedRowKeys) => {
                        setSelectedRowKeys(newSelectedRowKeys);
                    }
                }}
                dataSource={getRows()}
                columns={getColumns()}
                bordered
                loading={wordpressContentsLoading}
                pagination={{
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    current: page,
                    pageSize: perPage,
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
                    emptyText: <Empty description="No WordPress content found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />
            <Button
                disabled={selectedRowKeys.length === 0}
                onClick={async () => {
                    setImportingContent(true);
                    try {
                        await WordpressPolylangConnectionsAPI.importWordpressContent({
                            projectId: props.projectId,
                            wordpressContentIds: selectedRowKeys as string[]
                        });
                        message.success("Your content has been successfully imported and is ready for translation.");
                    } catch (error) {
                        console.error(error);
                        message.error("Failed to import translations.");
                    }
                    setImportingContent(false);
                }}
                style={{ marginLeft: "auto", marginTop: 24 }}
                loading={importingContent}
            >
                Import selected
            </Button>
        </div>
    );
}
