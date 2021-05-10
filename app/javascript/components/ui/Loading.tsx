import { Spin } from "antd";
import * as React from "react";

function Loading(props: { text?: string; style?: React.CSSProperties; size?: "large" | "small" }) {
    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flexGrow: 1,
                ...props.style
            }}
        >
            <Spin size={props.size || "large"} />
            <div style={{ marginTop: 16 }}>{props.text || "Loading the bits and bytes..."}</div>
        </div>
    );
}

export { Loading };
