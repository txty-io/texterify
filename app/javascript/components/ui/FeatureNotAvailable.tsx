import { Alert, Button, Tooltip } from "antd";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { IFeature } from "../types/IFeature";
import { IS_TEXTERIFY_CLOUD } from "../utilities/Env";
import { PermissionUtils } from "../utilities/PermissionUtils";
import { Constants } from "./Constants";

export function FeatureNotAvailable(props: { feature: IFeature; dataId?: string; style?: React.CSSProperties }) {
    let currentOrganization;

    if (dashboardStore.currentProject) {
        const currentOrganizationRelationship = dashboardStore.currentProject.relationships.organization.data;

        currentOrganization = APIUtils.getIncludedObject(
            currentOrganizationRelationship,
            dashboardStore.currentProjectIncluded
        );
    } else {
        currentOrganization = dashboardStore.currentOrganization;
    }

    if (!currentOrganization) {
        return null;
    }

    const buttonEnabled = IS_TEXTERIFY_CLOUD
        ? PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentOrganizationRole())
        : true;

    const unlockButton = (
        <Button
            data-id={props.dataId}
            type="primary"
            style={{
                cursor: buttonEnabled ? "pointer" : "default",
                fontSize: 12,
                height: "auto",
                lineHeight: "20px",
                padding: "4px 12px"
            }}
            disabled={!buttonEnabled}
            onClick={() => {
                if (IS_TEXTERIFY_CLOUD) {
                    if (PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentOrganizationRole())) {
                        history.push(
                            Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION.replace(
                                ":organizationId",
                                currentOrganization.id
                            )
                        );
                    }
                } else {
                    window.open(Constants.TEXTERIFY_PRICING_SITE, "_blank");
                }
            }}
        >
            Upgrade plan
        </Button>
    );

    return (
        <div style={{ display: "inline-block", alignSelf: "flex-start", justifyContent: "flex-start", ...props.style }}>
            {buttonEnabled ? (
                unlockButton
            ) : (
                <Tooltip title="Ask your organization manager to upgrade to unlock this feature.">
                    {unlockButton}
                </Tooltip>
            )}
        </div>
    );

    // return (
    //     <Alert
    //         icon={<StarFilled />}
    //         showIcon
    //         message={
    //             <>
    //                 This feature is not available on your current plan. Please{" "}
    //                 {PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole()) ? (
    //                     IS_TEXTERIFY_CLOUD ? (
    //                         <Link
    //                             to={Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION.replace(
    //                                 ":organizationId",
    //                                 currentOrganization.id
    //                             )}
    //                         >
    //                             upgrade
    //                         </Link>
    //                     ) : (
    //                         <a href={Constants.TEXTERIFY_PRICING_SITE} target="_blank">
    //                             upgrade
    //                         </a>
    //                     )
    //                 ) : (
    //                     "upgrade"
    //                 )}{" "}
    //                 to a plan that supports this feature: {capitalizedFeatureAvailableInPlans}
    //             </>
    //         }
    //         type="info"
    //         style={{ marginBottom: 16, maxWidth: 400, ...props.style }}
    //         data-id={props.dataId}
    //     />
    // );
}
