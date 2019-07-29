import { Spin } from "antd";
import * as React from "react";
import { Styles } from "./Styles";

function Loading() {
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
                Loading the bits and bytes...
            </div>
        </div>
    );
}

export { Loading };
