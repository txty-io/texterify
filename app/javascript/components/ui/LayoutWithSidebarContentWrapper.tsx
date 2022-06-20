import * as React from "react";

export function LayoutWithSidebarContentWrapper(props: { children: React.ReactNode }) {
    return <div style={{ padding: "0 24px 24px", flexGrow: 1 }}>{props.children}</div>;
}
