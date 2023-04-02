import { Alert, Button } from "antd";
import * as React from "react";
import { IProject } from "../../api/v1/ProjectsAPI";
import { useOrganization } from "../../network/useOrganization";
import { Routes } from "../../routing/Routes";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";

export function KeysLimitAlert(props: { style?: React.CSSProperties; project: IProject; refetchTrigger: number }) {
    const { data: organizationData, refetch: organizationRefetch } = useOrganization({
        organizationId: props.project.attributes.organization_id
    });

    React.useEffect(() => {
        organizationRefetch();
    }, [props.refetchTrigger]);

    if (
        !organizationData ||
        organizationData.data.attributes.keys_count < organizationData.data.attributes.keys_limit
    ) {
        return null;
    }

    return (
        <div style={props.style}>
            <Alert
                showIcon
                message="Key limit exceeded"
                description={
                    <>
                        You have reached your key limit ({organizationData?.data.attributes.keys_count}/
                        {organizationData?.data.attributes.keys_limit}) and will no longer be able to edit or add new
                        keys.
                        <br />
                        Delete some keys or upgrade to a higher paid plan to increase your limit and get access to more
                        premium features.
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