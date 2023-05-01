import { ExclamationCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import * as React from "react";

export function CustomAlert(props: {
    title?: string;
    description: React.ReactNode;
    type: "error" | "warning" | "info";
    "data-id"?: string;
    icon?: React.ReactNode;
    style?: React.CSSProperties;
}) {
    let backgroundColor = "";
    let borderColor = "";
    let textColor = "";
    let icon: React.ReactNode = null;

    if (props.type === "error") {
        backgroundColor = "var(--alert-error-background-color)";
        borderColor = "var(--alert-error-border-color)";
        textColor = "var(--alert-error-color)";
        const iconColor = "var(--alert-error-color)";
        icon = <ExclamationTriangleIcon style={{ color: iconColor }} />;
    } else if (props.type === "info") {
        backgroundColor = "var(--alert-info-background-color)";
        borderColor = "var(--alert-info-border-color)";
        textColor = "var(--alert-info-color)";
        const iconColor = "var(--alert-info-color)";
        icon = <ExclamationCircleIcon style={{ color: iconColor, width: "100%" }} />;
    } else if (props.type === "warning") {
        backgroundColor = "var(--alert-warning-background-color)";
        borderColor = "var(--alert-warning-border-color)";
        textColor = "var(--alert-warning-color)";
        const iconColor = "var(--alert-warning-color)";
        icon = <ExclamationCircleIcon style={{ color: iconColor, width: "100%" }} />;
    }

    return (
        <div
            style={{
                display: "flex",
                background: backgroundColor,
                border: `1px solid ${borderColor}`,
                maxWidth: "100%",
                borderRadius: "var(--general-border-radius)",
                padding: 16,
                ...props.style
            }}
            data-id={props["data-id"]}
        >
            <div
                style={{
                    flexShrink: 0,
                    marginRight: 20,
                    fontSize: props.title ? 24 : 20,
                    lineHeight: props.title ? "24px" : "22px",
                    width: 24
                }}
            >
                {props.icon ? props.icon : icon}
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {props.title && (
                    <div style={{ color: textColor, fontSize: 18, lineHeight: "24px", marginBottom: 12 }}>
                        {props.title}
                    </div>
                )}
                <div style={{ color: props.title ? "var(--color-full)" : textColor, lineHeight: "22px" }}>
                    {props.description}
                </div>
            </div>
        </div>
    );
}
