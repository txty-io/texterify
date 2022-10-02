import { Layout } from "antd";
import * as React from "react";

type ISize = "small" | "medium" | "big";

function getSize(size?: ISize) {
    if (size === "small") {
        return 640;
    } else if (size === "medium") {
        return 800;
    } else {
        return 1200;
    }
}

export function LayoutWithSidebarContentWrapperInner(props: { children: React.ReactNode; size?: ISize }) {
    return (
        <Layout.Content style={{ minHeight: 360, margin: "24px 16px 0px", maxWidth: getSize(props.size) }}>
            {props.children}
        </Layout.Content>
    );
}
