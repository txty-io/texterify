import { CloseCircleFilled } from "@ant-design/icons";
import * as React from "react";

export function CustomAlert(props: {
    title?: string;
    description: React.ReactNode;
    type: "error" | "info";
    icon?: React.ReactNode;
    style?: React.CSSProperties;
}) {
    let backgroundColor = "";
    let borderColor = "";
    let textColor = "";

    if (props.type === "error") {
        backgroundColor = "var(--alert-error-background-color)";
        borderColor = "var(--alert-error-border-color)";
        textColor = "var(--alert-error-color)";
    } else if (props.type === "info") {
        backgroundColor = "var(--alert-background-color)";
        borderColor = "var(--alert-border-color)";
        textColor = "var(--full-color)";
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
        >
            <div
                style={{
                    flexShrink: 0,
                    display: "flex",
                    marginRight: 24,
                    fontSize: 24,
                    lineHeight: "24px"
                }}
            >
                {props.icon ? props.icon : <CloseCircleFilled style={{ color: textColor }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                {props.title && (
                    <div style={{ color: textColor, fontSize: 18, lineHeight: "24px", marginBottom: 12 }}>
                        {props.title}
                    </div>
                )}
                <div style={{ color: props.title ? "var(--full-color)" : textColor }}>{props.description}</div>
            </div>
        </div>
    );
}
