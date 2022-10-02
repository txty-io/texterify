import { Layout } from "antd";
import * as React from "react";
import { getSizeContentWrapper, ISizeContentWrapper } from "./LayoutWithSidebarContentWrapperInner";

export function LayoutWithSubSidebarInnerContent(props: { children: React.ReactNode; size?: ISizeContentWrapper }) {
    return (
        <Layout.Content
            style={{ minHeight: 360, margin: "24px 16px 0px", maxWidth: getSizeContentWrapper(props.size) }}
        >
            {props.children}
        </Layout.Content>
    );
}
