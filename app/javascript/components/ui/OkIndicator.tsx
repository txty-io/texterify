import * as React from "react";
import { CheckCircleFilled } from "@ant-design/icons";
import { Tooltip } from "antd";

export function OkIndicator(props: { style?: React.CSSProperties; tooltip?: string }) {
    return (
        <Tooltip title={props.tooltip}>
            <CheckCircleFilled
                style={{
                    color: "#25b546",
                    ...props.style
                }}
            />
        </Tooltip>
    );
}
