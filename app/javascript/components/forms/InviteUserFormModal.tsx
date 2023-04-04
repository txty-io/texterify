import { UserAddOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Radio, Space } from "antd";
import * as React from "react";
import { MembersAPI } from "../api/v1/MembersAPI";
import { OrganizationInvitesAPI } from "../api/v1/OrganizationInvitesAPI";
import { OrganizationMembersAPI } from "../api/v1/OrganizationMembersAPI";
import { ProjectInvitesAPI } from "../api/v1/ProjectInvitesAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { IUserRole } from "../types/IUserRole";
import { ErrorUtils } from "../ui/ErrorUtils";
import { TexterifyModal } from "../ui/TexterifyModal";

function InviteUserFormModal(props: {
    organizationId?: string;
    projectId?: string;
    visible: boolean;
    userRole: IUserRole;
    onCancelRequest(): void;
    onSuccess(): void;
}) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [email, setEmail] = React.useState<string>("");
    const [role, setRole] = React.useState<IUserRole>("translator");

    function reset() {
        setEmail("");
        setRole("translator");
    }

    async function handleOrganizationInvite() {
        setLoading(true);

        try {
            const createMemberResponse = await OrganizationMembersAPI.createMember(props.organizationId, email, role);

            if (createMemberResponse.error) {
                if (createMemberResponse.message === "BASIC_PERMISSION_SYSTEM_FEATURE_NOT_AVAILABLE") {
                    ErrorUtils.showError("Please upgrade to a paid plan to add users to this organization.");
                } else if (createMemberResponse.message === "USER_ALREADY_ADDED") {
                    message.info("User has already been added to the organization.");
                } else if (createMemberResponse.message === "USER_NOT_FOUND") {
                    try {
                        const inviteReponse = await OrganizationInvitesAPI.create({
                            organizationId: props.organizationId,
                            email: email,
                            role: role
                        });

                        if (inviteReponse.error) {
                            if (inviteReponse.message === "USER_ALREADY_INVITED_OR_ADDED") {
                                message.info("User has already been invited or added to the organization.");
                            } else if (inviteReponse.message === "ROLE_NOT_FOUND") {
                                message.error("Please specify a valid role.");
                            } else if (inviteReponse.message === "FORBIDDEN") {
                                message.error("You are not allowed to invite users.");
                            }
                        } else {
                            message.success("Your invitation is on its way.");
                            reset();
                            props.onSuccess();
                        }
                    } catch (error) {
                        console.error(error);
                        message.error("Failed to invite user to organization.");
                    }
                } else {
                    ErrorUtils.showError("An unknown error occurred.");
                }
            } else if (createMemberResponse.errors) {
                ErrorUtils.showErrors(createMemberResponse.errors);
            } else {
                reset();
                props.onSuccess();
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to add user to organization.");
        }

        setLoading(false);
    }

    async function handleProjectInvite() {
        setLoading(true);

        try {
            const createMemberResponse = await MembersAPI.createMember(props.projectId, email, role);

            if (createMemberResponse.error) {
                if (createMemberResponse.message === "BASIC_PERMISSION_SYSTEM_FEATURE_NOT_AVAILABLE") {
                    ErrorUtils.showError("Please upgrade to a higher plan to add more users to this project.");
                } else if (createMemberResponse.message === "USER_ALREADY_ADDED") {
                    message.info("User has already been added to the project.");
                } else if (createMemberResponse.message === "USER_NOT_FOUND") {
                    try {
                        const inviteReponse = await ProjectInvitesAPI.create({
                            projectId: props.projectId,
                            email: email,
                            role: role
                        });

                        if (inviteReponse.error) {
                            if (inviteReponse.message === "USER_ALREADY_INVITED_OR_ADDED") {
                                message.info("User has already been invited or added to the project.");
                            } else if (inviteReponse.message === "ROLE_NOT_FOUND") {
                                message.error("Please specify a valid role.");
                            } else if (inviteReponse.message === "FORBIDDEN") {
                                message.error("You are not allowed to invite users.");
                            }
                        } else {
                            message.success("Your invitation is on its way.");
                            reset();
                            props.onSuccess();
                        }
                    } catch (error) {
                        console.error(error);
                        message.error("Failed to invite user to organization.");
                    }
                } else {
                    ErrorUtils.showError("An unknown error occurred.");
                }
            } else if (createMemberResponse.errors) {
                ErrorUtils.showErrors(createMemberResponse.errors);
            } else {
                reset();
                props.onSuccess();
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to add user to project.");
        }

        setLoading(false);
    }

    return (
        <>
            <TexterifyModal
                title={
                    <>
                        <UserAddOutlined style={{ marginRight: 8 }} /> Invite a user
                    </>
                }
                visible={props.visible}
                footer={
                    <div style={{ margin: "6px 0" }}>
                        <Button
                            onClick={() => {
                                reset();
                                props.onCancelRequest();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            id="invite-user-submit"
                            type="primary"
                            htmlType="submit"
                            form="inviteUser"
                            loading={loading}
                        >
                            Send invite
                        </Button>
                    </div>
                }
                onCancel={() => {
                    reset();
                    props.onCancelRequest();
                }}
            >
                <p>
                    Invite a user by entering an email address and selecting a role. If there is no account for that
                    email address the user will be automatically added once they sign up.
                </p>
                <h3 style={{ marginTop: 24 }}>Enter an email address</h3>
                <Form
                    name="inviteUser"
                    onFinish={async () => {
                        if (props.projectId) {
                            await handleProjectInvite();
                        } else if (props.organizationId) {
                            await handleOrganizationInvite();
                        } else {
                            console.error("No organization or project ID given.");
                        }
                    }}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                type: "email",
                                required: true,
                                whitespace: true,
                                message: "Please enter an email address."
                            }
                        ]}
                    >
                        <Input
                            placeholder="Email address"
                            onChange={async (event) => {
                                setEmail(event.target.value);
                            }}
                            value={email}
                            disabled={loading}
                        />
                    </Form.Item>
                </Form>
                <h3 style={{ marginTop: 24 }}>Select a role</h3>
                <Radio.Group
                    onChange={(e) => {
                        setRole(e.target.value);
                    }}
                    value={role}
                    disabled={loading}
                >
                    <Space direction="vertical">
                        <Radio value="translator">Translator</Radio>
                        <Radio value="developer">Developer</Radio>
                        <Radio value="manager" disabled={props.userRole !== "owner"}>
                            Manager
                        </Radio>
                    </Space>
                </Radio.Group>
            </TexterifyModal>
        </>
    );
}

export { InviteUserFormModal };
