import { Layout } from "antd";
import * as React from "react";

export function LayoutWithSubSidebar(props: { children: React.ReactNode }) {
    return (
        <Layout style={{ padding: "0", margin: "0", width: "100%", display: "flex", flexDirection: "row" }}>
            {props.children}
        </Layout>
    );
}
