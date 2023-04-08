import { Alert } from "antd";
import * as React from "react";
import { IOrganization } from "../stores/DashboardStore";
import { IS_TEXTERIFY_CLOUD } from "../utilities/Env";
import { CustomAlert } from "./CustomAlert";

export const OrganizationMachineTranslationTotalUsage = (props: {
    organization: IOrganization;
    style?: React.CSSProperties;
}) => {
    return (
        <div style={props.style}>
            <h3>Total usage</h3>
            <p>This is the total amount of characters machine translated over all your projects.</p>
            <div style={{ display: "flex", fontSize: 16 }}>
                <span style={{ fontWeight: "bold", marginRight: 24 }}>Usage:</span>
                {props.organization?.attributes.machine_translation_character_usage}/
                {props.organization?.attributes.machine_translation_character_limit} characters
            </div>

            {IS_TEXTERIFY_CLOUD && !props.organization?.attributes.uses_custom_deepl_account && (
                <CustomAlert
                    type="info"
                    description={
                        <>
                            Your available machine translation characters are reset on the first of every month. If you
                            need more monthly machine translation characters contact support via{" "}
                            <a href="mailto:support@texterify.com" target="_blank">
                                support@texterify.com
                            </a>
                            .
                        </>
                    }
                    style={{ marginTop: 24 }}
                />
            )}

            {props.organization?.attributes.uses_custom_deepl_account && (
                <Alert
                    showIcon
                    type="info"
                    message="The limits above represent the usage and limits of your own DeepL account. Check your DeepL account for further information."
                    style={{ marginTop: 24 }}
                />
            )}
        </div>
    );
};
