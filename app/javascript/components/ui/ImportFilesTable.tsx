import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Table, Tag } from "antd";
import * as React from "react";
import { IImportFile } from "../api/v1/ImportsAPI";
import useImportFiles from "../hooks/useImportFiles";
import { CustomAlert } from "./CustomAlert";

function Status(props: { importFile: IImportFile }) {
    if (props.importFile.attributes.status === "CREATED") {
        return <Tag>New</Tag>;
    } else if (props.importFile.attributes.status === "VERIFIED") {
        return <Tag color="green">Verified</Tag>;
    } else if (props.importFile.attributes.status === "ERROR") {
        return <Tag color="red">Error</Tag>;
    }
}

function ErrorDetails(props: { importFile: IImportFile }) {
    const [showDetails, setShowDetails] = React.useState<boolean>(false);

    if (props.importFile.attributes.status !== "ERROR") {
        return null;
    }

    let statusMessage: React.ReactNode = props.importFile.attributes.status_message;
    if (props.importFile.attributes.status_message === "ERROR_WHILE_PARSING") {
        statusMessage = (
            <>
                An error occurred while parsing.
                <br />
                Maybe you selected the wrong import format?
            </>
        );
    } else if (props.importFile.attributes.status_message === "UNKNOWN_ERROR") {
        statusMessage = (
            <>
                An unknown error occurred during import.
                <br />
                See the details below for more information.
            </>
        );
    }

    return (
        <div>
            <div style={{ color: "var(--color-error)" }}>{statusMessage}</div>
            {props.importFile.attributes.error_message && (
                <>
                    <Button type="link" onClick={() => setShowDetails(!showDetails)} style={{ marginTop: 8 }}>
                        {showDetails ? (
                            <>
                                Hide details <DownOutlined style={{ marginLeft: 4 }} />
                            </>
                        ) : (
                            <>
                                More details <RightOutlined style={{ marginLeft: 4 }} />
                            </>
                        )}
                    </Button>
                    {showDetails && (
                        <CustomAlert
                            description={props.importFile.attributes.error_message}
                            type="error"
                            style={{ marginTop: 8 }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export function ImportFilesTable(props: {
    projectId: string;
    importId: string;
    showImportFailedOnesLaterHint?: boolean;
    style?: React.CSSProperties;
}) {
    const { importFilesResponse, importFilesLoading } = useImportFiles({
        projectId: props.projectId,
        importId: props.importId
    });

    function getRows() {
        if (!importFilesResponse?.data) {
            return [];
        }

        const rows = [];
        importFilesResponse.data.forEach((importFile) => {
            rows.push({
                key: importFile.id,
                name: importFile.attributes.name,
                status: <Status importFile={importFile} />,
                message: <ErrorDetails importFile={importFile} />
            });
        });

        return rows;
    }

    function getColumns() {
        const columns: { title: React.ReactNode; dataIndex: string; key?: string; width?: number }[] = [
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                width: 64
            },
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Message",
                dataIndex: "message",
                key: "message",
                width: 640
            }
        ];

        return columns;
    }

    const hasFailedImportFiles = importFilesResponse?.data?.find((item) => item.attributes.status !== "VERIFIED");
    const hasVerifiedImportFiles = importFilesResponse?.data?.find((item) => item.attributes.status === "VERIFIED");

    return (
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            {props.showImportFailedOnesLaterHint && hasFailedImportFiles && hasVerifiedImportFiles && (
                <CustomAlert
                    description="There are files which could not be verified, but you can still import the translations from the verified files and try the failed ones again later."
                    type="info"
                    style={{ marginBottom: 16, maxWidth: "100%" }}
                />
            )}
            <Table
                style={props.style}
                dataSource={getRows()}
                columns={getColumns()}
                bordered
                loading={importFilesLoading}
                pagination={false}
            />
        </div>
    );
}
