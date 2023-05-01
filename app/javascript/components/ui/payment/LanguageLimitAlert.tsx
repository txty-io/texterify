import { Button } from "antd";
import * as React from "react";
import { useOrganization } from "../../network/useOrganization";
import { useProject } from "../../network/useProject";
import { Routes } from "../../routing/Routes";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";
import { CustomAlert } from "../CustomAlert";

export function LanguageLimitAlert(props: { style?: React.CSSProperties; projectId?: string; refetchTrigger: number }) {
    const { data: projectResponse, refetch: projectResponseRefetch } = useProject({
        projectId: props.projectId
    });

    React.useEffect(() => {
        projectResponseRefetch();
    }, [props.refetchTrigger]);

    const { data: organizationData } = useOrganization({
        organizationId: projectResponse?.data.attributes.organization_id
    });

    if (!projectResponse?.data.attributes.language_limit_reached) {
        return null;
    }

    return (
        <div style={props.style}>
            <CustomAlert
                title="Language limit reached"
                data-id="language-limit-reached-alert"
                description={
                    <>
                        You have reached your language limit ({projectResponse.data.attributes.language_count}/
                        {organizationData?.data.attributes.language_limit_per_project}) and will no longer be able to
                        add new languages.
                        <br />
                        Delete a language or upgrade your plan to increase your limit.
                        <>
                            {IS_TEXTERIFY_CLOUD && (
                                <div style={{ marginTop: 16, marginBottom: 4 }}>
                                    <Button
                                        danger
                                        href={Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION_RESOLVER({
                                            organizationId: projectResponse.data.attributes.organization_id
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
