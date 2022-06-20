import * as React from "react";

export function EditorSidebarInfo(props: { name: string; value: string }) {
    return (
        <div style={{ display: "flex", fontSize: 13 }}>
            <div style={{ marginRight: 16, fontWeight: "bold", width: 120 }}>{props.name}:</div>
            <div>{props.value}</div>
        </div>
    );
}
