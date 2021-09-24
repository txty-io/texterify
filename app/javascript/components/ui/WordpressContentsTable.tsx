import { Button, Empty, message, Table } from "antd";
import * as React from "react";
import {
    IGetWordpressContentsResponse,
    WordpressPolylangConnectionsAPI
} from "../api/v1/WordpressPolylangConnectionsAPI";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";
import * as moment from "moment";
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
            <Button
                onClick={async () => {
                    setWordpressContentsLoading(true);
                    try {
                        await WordpressPolylangConnectionsAPI.pullWordpressContent({
                            projectId: props.projectId
                        });
                        const response = await WordpressPolylangConnectionsAPI.getWordpressContent({
                            projectId: props.projectId
                        });
                        setWordpressContentsResponse(response);
                    } catch (error) {
                        console.error();
                    }
                    setWordpressContentsLoading(false);
                }}
                type="primary"
                style={{ alignSelf: "flex-start", marginTop: 8, marginBottom: 4 }}
                loading={wordpressContentsLoading}
            >
                Sync WordPress content
            </Button>
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
                    onChange: async (newPage) => {
                        setPage(newPage);
                        reload({ page: newPage });
                    },
                    onShowSizeChange: async (_, newPerPage) => {
                        setPerPage(newPerPage);
                        reload({ page: 1, perPage: newPerPage });
                    }
                }}
                locale={{
                    emptyText: <Empty description="No WordPress content found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />
            <Button
                disabled={selectedRowKeys.length === 0}
                onClick={async () => {
                    await WordpressPolylangConnectionsAPI.importWordpressContent({
                        projectId: props.projectId,
                        wordpressContentIds: selectedRowKeys as string[]
                    });
                    message.success("Your content has been successfully imported and is ready for translation.");
                }}
                style={{ marginLeft: "auto", marginTop: 24 }}
            >
                Import selected
            </Button>
        </div>
    );
}
