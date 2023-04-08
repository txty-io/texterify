import { CloseCircleFilled } from "@ant-design/icons";
import * as React from "react";

export function CustomAlert(props: {
    title?: string;
    description: React.ReactNode;
    type: "error";
    style?: React.CSSProperties;
}) {
    return (
        <div
            style={{
                display: "flex",
                background: "var(--alert-error-background-color)",
                border: "1px solid var(--alert-error-border-color)",
                maxWidth: "100%",
                borderRadius: "var(--general-border-radius)",
                padding: 16,
                ...props.style
            }}
        >
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", marginRight: 16 }}>
                <CloseCircleFilled style={{ color: "var(--alert-error-color)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                {props.title && <div style={{ color: "var(--alert-error-color)", fontSize: 18 }}>{props.title}</div>}
                <div style={{ color: props.title ? "var(--full-color)" : "var(--alert-error-color)" }}>
                    {props.description}
                </div>
            </div>
        </div>
    );
}
