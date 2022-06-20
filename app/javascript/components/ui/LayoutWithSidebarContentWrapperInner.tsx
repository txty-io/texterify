import { Layout } from "antd";
import * as React from "react";

export function LayoutWithSidebarContentWrapperInner(props: { children: React.ReactNode }) {
    return (
        <Layout.Content style={{ minHeight: 360, margin: "24px 16px 0px", maxWidth: 1200 }}>
            {props.children}
        </Layout.Content>
    );
}
