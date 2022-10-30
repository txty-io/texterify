import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import * as React from "react";

export function QuestionIconWithTooltip(props: { tooltip: string; style?: React.CSSProperties }) {
    return (
        <Tooltip title={props.tooltip}>
            <QuestionCircleOutlined style={props.style} />
        </Tooltip>
    );
}
