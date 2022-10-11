import { Layout } from "antd";
import * as React from "react";

export type ISizeContentWrapper = "small" | "medium" | "big";

export function getSizeContentWrapper(size?: ISizeContentWrapper) {
    if (size === "small") {
        return 640;
    } else if (size === "medium") {
        return 800;
    } else {
        return 1200;
    }
}

export function LayoutWithSidebarContentWrapperInner(props: { children: React.ReactNode; size?: ISizeContentWrapper }) {
    return (
        <Layout.Content
            style={{ minHeight: 360, margin: "24px 16px 0px", maxWidth: getSizeContentWrapper(props.size) }}
        >
            {props.children}
        </Layout.Content>
    );
}
