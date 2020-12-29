import { Alert } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../routing/Routes";
import { dashboardStore, IFeature } from "../stores/DashboardStore";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { Utils } from "./Utils";

export function FeatureNotAvailable(props: { feature: IFeature; style?: React.CSSProperties }) {
    if (!dashboardStore.currentProject.relationships.organization.data) {
        return (
            <Alert
                showIcon
                message={
                    <>
                        Premium features are not available for private projects. Please move your project to an
                        organization.
                    </>
                }
                type="info"
                style={{ marginBottom: 16, maxWidth: 400, ...props.style }}
            />
        );
    }

    const featureAvailableInPlans = dashboardStore.currentOrganization.attributes.all_features[props.feature];
    const capitalizedFeatureAvailableInPlans = featureAvailableInPlans.map((plan) => {
        return (
            <span key={plan} style={{ fontWeight: "bold", marginRight: 8 }}>
                {Utils.capitalize(plan)}
            </span>
        );
    });

    return (
        <Alert
            showIcon
            message={
                <>
                    This feature is not available on your current plan. Please{" "}
                    {PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole()) ? (
                        <Link
                            to={Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION.replace(
                                ":organizationId",
                                dashboardStore.currentOrganization.id
                            )}
                        >
                            upgrade
                        </Link>
                    ) : (
                        "upgrade"
                    )}{" "}
                    to a plan that supports this feature: {capitalizedFeatureAvailableInPlans}
                </>
            }
            type="info"
            style={{ marginBottom: 16, maxWidth: 400, ...props.style }}
        />
    );
}
