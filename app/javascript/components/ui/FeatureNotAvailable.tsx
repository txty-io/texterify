import { StarFilled } from "@ant-design/icons";
import { Alert } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { APIUtils } from "../api/v1/APIUtils";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { IFeature } from "../types/IFeature";
import { IS_TEXTERIFY_CLOUD } from "../utilities/Env";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { Constants } from "./Constants";
import { Utils } from "./Utils";

export function FeatureNotAvailable(props: { feature: IFeature; style?: React.CSSProperties }) {
    if (!dashboardStore.currentProject) {
        return null;
    }

    const currentOrganizationRelationship = dashboardStore.currentProject.relationships.organization.data;

    if (!currentOrganizationRelationship) {
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

    const currentOrganization = APIUtils.getIncludedObject(
        currentOrganizationRelationship,
        dashboardStore.currentProjectIncluded
    );

    if (!currentOrganization) {
        return null;
    }

    const featureAvailableInPlans = currentOrganization.attributes.all_features[props.feature];
    const capitalizedFeatureAvailableInPlans = featureAvailableInPlans.map((plan) => {
        return (
            <span key={plan} style={{ fontWeight: "bold", marginRight: 8 }}>
                {Utils.capitalize(plan)}
            </span>
        );
    });

    return (
        <Alert
            icon={<StarFilled />}
            showIcon
            message={
                <>
                    This feature is not available on your current plan. Please{" "}
                    {PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole()) ? (
                        IS_TEXTERIFY_CLOUD ? (
                            <Link
                                to={Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION.replace(
                                    ":organizationId",
                                    currentOrganization.id
                                )}
                            >
                                upgrade
                            </Link>
                        ) : (
                            <a href={Constants.TEXTERIFY_PRICING_SITE} target="_blank">
                                upgrade
                            </a>
                        )
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
