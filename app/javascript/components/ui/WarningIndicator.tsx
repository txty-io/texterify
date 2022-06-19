import { WarningFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import * as React from "react";

export function WarningIndicator(props: { style?: React.CSSProperties; tooltip?: string }) {
    return (
        <Tooltip title={props.tooltip}>
            <WarningFilled
                style={{
                    color: "var(--color-warn)",
                    ...props.style
                }}
            />
        </Tooltip>
    );
}
