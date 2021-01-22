import { Tag, Tooltip } from "antd";
import * as React from "react";
import { PermissionUtils } from "../utilities/PermissionUtils";

export function RolesLegend(props: { style?: React.CSSProperties }) {
    return (
        <div style={{ display: "flex", alignItems: "center", ...props.style }}>
            Roles:
            <Tooltip
                title={
                    <p style={{ fontSize: 11 }}>
                        Translators can do the following:
                        <ul>
                            <li style={{ color: "#f00" }}>V</li>
                        </ul>
                    </p>
                }
            >
                <Tag color={PermissionUtils.getColorByRole("translator")} style={{ marginLeft: 16 }}>
                    Translator
                </Tag>
            </Tooltip>
            <Tooltip title="">
                <Tag color={PermissionUtils.getColorByRole("developer")} style={{ marginLeft: 8 }}>
                    Developer
                </Tag>
            </Tooltip>
            <Tooltip title="">
                <Tag color={PermissionUtils.getColorByRole("manager")} style={{ marginLeft: 8 }}>
                    Manager
                </Tag>
            </Tooltip>
            <Tooltip title="">
                <Tag color={PermissionUtils.getColorByRole("owner")} style={{ marginLeft: 8 }}>
                    Owner
                </Tag>
            </Tooltip>
        </div>
    );
}
