import { LockOutlined } from "@ant-design/icons";
import { Alert } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../routing/Routes";
import { dashboardStore, IOrganization } from "../stores/DashboardStore";
import { TexterifyModal } from "./TexterifyModal";

function getTextByDeactivatedReason(reason: IOrganization["attributes"]["current_user_deactivated_reason"]) {
    if (reason === "manually_by_admin") {
        return "Your accout has been disabled by an administrator of your organization. If you think this was a mistake please contact them to reactivate your account.";
    } else if (reason === "expired_subscription") {
        return "Your account has been disabled because the subscription of your organization expired. Please contact your organization administrator to inform them that they need to resubscribe and then activate your account. Unless then you won't be able to use Texterify again within this organization.";
    } else {
        return "Your account has been disabled. Please contact your organization administrator to enable your account.";
    }
}

export function UserDeactivatedOrganizationModal() {
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
                <Link
                    to={Routes.DASHBOARD.ORGANIZATIONS}
                    style={{ margin: "8px 14px", display: "flex", justifyContent: "flex-end" }}
                >
                    Go back to organizations
                </Link>
            }
        >
            {dashboardStore.currentOrganization && (
                <>
                    Organization: <b>{dashboardStore.currentOrganization.attributes.name}</b>
                </>
            )}
            {getTextByDeactivatedReason(dashboardStore.currentOrganization.attributes.current_user_deactivated_reason)}
            <Alert
                type="info"
                showIcon
                message="Although your account has been disabled for this organization you might still be able to access other organizations."
                description=""
                style={{ marginBottom: 16 }}
            />
        </TexterifyModal>
    );
}
