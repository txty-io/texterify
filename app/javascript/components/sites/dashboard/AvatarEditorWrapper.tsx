import * as React from "react";

export function AvatarEditorWrapper(props: { children: React.ReactNode }) {
    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                borderRadius: 4,
                overflow: "hidden"
            }}
        >
            {props.children}
        </div>
    );
}
