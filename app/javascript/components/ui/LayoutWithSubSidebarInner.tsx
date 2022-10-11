import * as React from "react";

export function LayoutWithSubSidebarInner(props: { children: React.ReactNode }) {
    return <div style={{ padding: "0px 24px 24px", flexGrow: 1 }}>{props.children}</div>;
}
