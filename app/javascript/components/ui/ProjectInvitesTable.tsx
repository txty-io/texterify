import { Button, Empty, Popconfirm, Table, Tag } from "antd";
import moment from "moment";
import * as React from "react";
import { IProjectInvite, ProjectInvitesAPI } from "../api/v1/ProjectInvitesAPI";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { Utils } from "./Utils";

export function ProjectInvitesTable(props: { loading: boolean; projectInvites: IProjectInvite[]; onDelete(): void }) {
    const [deleting, setDeleting] = React.useState<boolean>(false);

    function getTableRows() {
        return props.projectInvites.map((invite) => {
            return {
                id: invite.id,
                key: invite.id,
                email: invite.attributes.email,
                role: invite.attributes.role,
                created_at: invite.attributes.created_at,
                controls: (
                    <Popconfirm
                        title="Do you want to withdraw this invitation?"
                        onConfirm={async () => {
                            setDeleting(true);

                            try {
                                await ProjectInvitesAPI.delete({
                                    projectId: invite.attributes.project_id,
                                    inviteId: invite.id
                                });

                                props.onDelete();
                            } catch (error) {
                                console.error(error);
                            }

                            setDeleting(false);
                        }}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger>Withdraw invite</Button>
                    </Popconfirm>
                )
            };
        }, []);
    }

    function getTableColumns() {
        return [
            {
                title: "E-Mail",
                key: "email",
                render: (_text, record) => {
                    return <span style={{ color: "var(--color-full)" }}>{record.email}</span>;
                }
            },
            {
                title: "Role",
                key: "role",
                render: (_text, record) => {
                    return (
                        <Tag color={PermissionUtils.getColorByRole(record.role)}>{Utils.capitalize(record.role)}</Tag>
                    );
                }
            },
            {
                title: "Invited at",
                key: "sentAt",
                render: (_text, record) => {
                    return moment(record.created_at).format("DD.MM.YYYY HH:mm");
                }
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50
            }
        ];
    }

    return (
        <Table
            dataSource={getTableRows()}
            columns={getTableColumns()}
            loading={deleting || props.loading}
            pagination={false}
            bordered
            locale={{
                emptyText: <Empty description="No invites found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }}
        />
    );
}
