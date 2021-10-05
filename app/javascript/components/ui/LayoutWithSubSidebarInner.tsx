import * as React from "react";

export function LayoutWithSubSidebarInner(props: { children: React.ReactNode; smallWidth?: boolean }) {
    return (
        <div style={{ padding: "0px 24px 24px", flexGrow: 1, maxWidth: props.smallWidth ? 960 : undefined }}>
            {props.children}
        </div>
    );
}
