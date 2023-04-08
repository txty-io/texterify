import { Alert, Button } from "antd";
import * as React from "react";
import { Routes } from "../../routing/Routes";
import { IOrganization } from "../../stores/DashboardStore";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";

export function ProjectLimitAlert(props: { style?: React.CSSProperties; organization: IOrganization }) {
    if (!props.organization || !props.organization.attributes.project_limit_reached) {
        return null;
    }

    return (
        <div style={props.style}>
            <Alert
                showIcon
                message="Project limit reached"
                description={
                    <>
                        You have reached the project limit ({props.organization.attributes.project_count}/
                        {props.organization.attributes.project_limit}) of your organization and will no longer be able
                        to create new projects.
                        <br />
                        Upgrade your plan to increase your limit.
                        <>
                            {IS_TEXTERIFY_CLOUD && (
                                <div style={{ marginTop: 16, marginBottom: 4 }}>
                                    <Button
                                        danger
                                        href={Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION_RESOLVER({
                                            organizationId: props.organization.id
                                        })}
                                        type="primary"
                                        target="_blank"
                                    >
                                        Upgrade plan
                                    </Button>
                                </div>
                            )}
                        </>
                    </>
                }
                type="error"
                style={{ maxWidth: "100%" }}
            />
        </div>
    );
}
