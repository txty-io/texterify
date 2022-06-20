import { Layout } from "antd";
import * as React from "react";

export function LayoutWithSidebar(props: { children: React.ReactNode }) {
    return (
        <Layout style={{ padding: "0 24px 24px 0", margin: "0", width: "100%", display: "flex", flexDirection: "row" }}>
            {props.children}
        </Layout>
    );
}
