import * as React from "react";

export function SiteHeader(props: { icon?: React.ReactNode; title: string }) {
    return (
        <h1 style={{ display: "flex", alignItems: "center" }}>
            {props.icon && <div style={{ width: 16, marginRight: 12, fontSize: 16, lineHeight: 16 }}>{props.icon}</div>}
            {props.title}
        </h1>
    );
}
