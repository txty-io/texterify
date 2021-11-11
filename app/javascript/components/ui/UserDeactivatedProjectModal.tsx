import { LockOutlined } from "@ant-design/icons";
import { Alert, Button, Modal } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { MembersAPI } from "../api/v1/MembersAPI";
import { OrganizationMembersAPI } from "../api/v1/OrganizationMembersAPI";
import { IProject } from "../api/v1/ProjectsAPI";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { dashboardStore } from "../stores/DashboardStore";
import { ErrorUtils } from "./ErrorUtils";
import { TexterifyModal } from "./TexterifyModal";

function getTextByDeactivatedReason(reason: IProject["attributes"]["current_user_deactivated_reason"]) {
    if (reason === "manually_by_admin") {
        return "Your accout has been disabled by an administrator of your organization. If you think this was a mistake please contact them to reactivate your account.";
    } else if (reason === "expired_subscription") {
        return "Your account has been disabled because the subscription of your project organization expired. Please contact your organization administrator to inform them that they need to resubscribe and then activate your account. Unless then you won't be able to use Texterify again within this organization.";
    } else {
        return "Your account has been disabled. Please contact your project organization administrator to enable your account.";
    }
}

export function UserDeactivatedProjectModal() {
    return (
        <TexterifyModal
            visible
            title={
                <>
                    <LockOutlined style={{ marginRight: 16 }} /> Your account has been disabled
                </>
            }
            closable={false}
            footer={
                <div style={{ margin: "8px 14px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <Link to={Routes.DASHBOARD.PROJECTS}>Go back to projects</Link>
                    {dashboardStore.currentProject.attributes.current_user_in_project_organization && (
                        <Button
                            danger
                            style={{ marginLeft: 24 }}
                            onClick={() => {
                                Modal.confirm({
                                    title: "Do you really want to leave this organization?",
                                    content: "This cannot be undone.",
                                    okText: "Yes",
                                    okButtonProps: {
                                        danger: true
                                    },
                                    cancelText: "No",
                                    autoFocusButton: "cancel",
                                    visible: true,
                                    onOk: async () => {
                                        try {
                                            const response = await OrganizationMembersAPI.deleteMember(
                                                dashboardStore.currentProject.attributes.organization_id,
                                                authStore.currentUser.id
                                            );

                                            if (response.error) {
                                                if (response.message === "LAST_USER_CANT_LEAVE") {
                                                    ErrorUtils.showError(
                                                        "You can't leave as the last user of an organization."
                                                    );
                                                } else {
                                                    ErrorUtils.showError("Failed to leave organization.");
                                                }
                                            } else {
                                                history.push(Routes.DASHBOARD.PROJECTS);
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            ErrorUtils.showError("Failed to leave organization.");
                                        }
                                    }
                                });
                            }}
                        >
                            Leave organization
                        </Button>
                    )}

                    {dashboardStore.currentProject.attributes.current_user_in_project && (
                        <Button
                            danger
                            style={{ marginLeft: 24 }}
                            onClick={() => {
                                Modal.confirm({
                                    title: "Do you really want to leave this project?",
                                    content: "This cannot be undone.",
                                    okText: "Yes",
                                    okButtonProps: {
                                        danger: true
                                    },
                                    cancelText: "No",
                                    autoFocusButton: "cancel",
                                    visible: true,
                                    onOk: async () => {
                                        try {
                                            const response = await MembersAPI.deleteMember(
                                                dashboardStore.currentProject.attributes.organization_id,
                                                authStore.currentUser.id
                                            );

                                            if (!response.errors && !response.error) {
                                                history.push(Routes.DASHBOARD.PROJECTS);
                                            }
                                        } catch (error) {
                                            console.error(error);
                                            ErrorUtils.showError("Failed to leave project.");
                                        }
                                    }
                                });
                            }}
                        >
                            Leave project
                        </Button>
                    )}
                </div>
            }
        >
            {dashboardStore.currentProject && (
                <>
                    Project: <b>{dashboardStore.currentProject.attributes.name}</b>
                </>
            )}
            <p style={{ marginTop: 24 }}>
                {getTextByDeactivatedReason(dashboardStore.currentProject.attributes.current_user_deactivated_reason)}
            </p>
            <Alert
                type="info"
                showIcon
                message="Although your account has been disabled for this organization you might still be able to access other organizations."
                style={{ marginTop: 24 }}
            />
        </TexterifyModal>
    );
}
