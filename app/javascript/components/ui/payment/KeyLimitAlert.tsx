import { Button } from "antd";
import * as React from "react";
import { IProject } from "../../api/v1/ProjectsAPI";
import { useOrganization } from "../../network/useOrganization";
import { Routes } from "../../routing/Routes";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";
import { CustomAlert } from "../CustomAlert";

export function KeyLimitAlert(props: {
    style?: React.CSSProperties;
    project?: IProject;
    showOnlyIfLimitExceeded?: boolean;
    refetchTrigger: number;
}) {
    const { data: organizationResponse, refetch: organizationResponseRefetch } = useOrganization({
        organizationId: props.project?.attributes.organization_id
    });

    React.useEffect(() => {
        organizationResponseRefetch();
    }, [props.refetchTrigger]);

    if (
        !props.project ||
        !organizationResponse ||
        !(
            (!props.showOnlyIfLimitExceeded && organizationResponse.data.attributes.key_limit_reached) ||
            organizationResponse.data.attributes.key_limit_exceeded
        )
    ) {
        return null;
    }

    return (
        <div style={props.style}>
            <CustomAlert
                title={
                    organizationResponse.data.attributes.key_limit_exceeded ? "Key limit exceeded" : "Key limit reached"
                }
                description={
                    <>
                        You have {organizationResponse.data.attributes.key_limit_exceeded ? "exceeded" : "reached"} your
                        key limit ({organizationResponse?.data.attributes.key_count}/
                        {organizationResponse?.data.attributes.key_limit}) and will no longer be able to{" "}
                        {organizationResponse.data.attributes.key_limit_exceeded
                            ? "edit or add new keys"
                            : "add new keys"}
                        .
                        <br />
                        Upgrade your plan to increase your limit.
                        <>
                            {IS_TEXTERIFY_CLOUD && (
                                <div style={{ marginTop: 16, marginBottom: 4 }}>
                                    <Button
                                        danger
                                        href={Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION_RESOLVER({
                                            organizationId: props.project.attributes.organization_id
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
