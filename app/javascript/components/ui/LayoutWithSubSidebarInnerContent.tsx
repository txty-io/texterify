import { Layout } from "antd";
import * as React from "react";

export function LayoutWithSubSidebarInnerContent(props: { children: React.ReactNode; verySmallWidth?: boolean }) {
    return (
        <Layout.Content
            style={{ minHeight: 360, margin: "24px 16px 0px", maxWidth: props.verySmallWidth ? 560 : undefined }}
        >
            {props.children}
        </Layout.Content>
    );
}
