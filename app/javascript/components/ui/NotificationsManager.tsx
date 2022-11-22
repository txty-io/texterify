import { NotificationOutlined } from "@ant-design/icons";
import { Button, message, Skeleton, Tooltip } from "antd";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DashboardAPI } from "../api/v1/DashboardAPI";
import { TexterifyModalFooterWrapper } from "../forms/TexterifyModalFooterWrapper";
import { TexterifyModal } from "./TexterifyModal";

export function NotificationsManager(props: { style?: React.CSSProperties }) {
    const [open, setOpen] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [changelog, setChangelog] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Load changelog after opening of modal.
        if (open && !changelog) {
            (async () => {
                try {
                    setLoading(true);
                    const response = await DashboardAPI.getChangelog();
                    setChangelog(response.changelog);
                    setLoading(false);
                } catch (error) {
                    console.error(error);
                    message.error("Failed to load changelog.");
                }
            })();
        }
    }, [open]);

    return (
        <>
            <Tooltip title="Release notes">
                <NotificationOutlined
                    style={props.style}
                    onClick={() => {
                        setOpen(true);
                    }}
                />
            </Tooltip>
            <TexterifyModal
                visible={open}
                title="Release notes"
                footer={
                    <TexterifyModalFooterWrapper>
                        <Button
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    </TexterifyModalFooterWrapper>
                }
                big
                onCancel={() => {
                    setOpen(false);
                }}
            >
                {loading && <Skeleton active loading />}
                {!loading && changelog && (
                    <div className="enable-ul" style={{ maxHeight: 540, overflowY: "auto" }}>
                        <ReactMarkdown children={changelog} remarkPlugins={[remarkGfm]} disallowedElements={["h1"]} />
                    </div>
                )}
            </TexterifyModal>
        </>
    );
}
