import * as React from "react";
import { Styles } from "./Styles";

export function HighlightBox(props: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div
            style={{
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                background: "var(--highlight-color-decent)",
                padding: "12px 16px",
                ...props.style
            }}
        >
            {props.children}
        </div>
    );
}
