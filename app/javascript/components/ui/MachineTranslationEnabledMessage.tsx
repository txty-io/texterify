import { CheckOutlined, CloseCircleOutlined } from "@ant-design/icons";
import * as React from "react";
import { IProject } from "../api/v1/ProjectsAPI";

export function MachineTranslationEnabledMessage(props: { project: IProject; styles?: React.CSSProperties }) {
    return (
        <span style={props.styles}>
            {props.project.attributes.machine_translation_enabled ? (
                <span
                    style={{
                        display: "inline-block",
                        fontStyle: "italic",
                        color: "var(--color-passive)",
                        fontSize: 12
                    }}
                >
                    <CheckOutlined style={{ color: "var(--color-success)", marginRight: 8 }} />
                    Machine translation is enabled.
                </span>
            ) : (
                <span
                    style={{
                        display: "inline-block",
                        fontStyle: "italic",
                        color: "var(--color-passive)",
                        fontSize: 12
                    }}
                >
                    <CloseCircleOutlined style={{ color: "var(--color-error)", marginRight: 8 }} />
                    Machine translation is disabled.
                </span>
            )}
        </span>
    );
}
