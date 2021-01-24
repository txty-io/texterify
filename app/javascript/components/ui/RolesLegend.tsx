import { Tag, Tooltip } from "antd";
import * as React from "react";
import { PermissionUtils } from "../utilities/PermissionUtils";
import styled from "styled-components";

const ListElement = styled.li`
    list-style: inherit;
`;

const TRANSLATOR_ACTIONS = ["Edit translations"];

const DEVELOPER_ACTIONS = [
    "Edit translations",
    "Manage keys",
    "Manage languages",
    "Manage post processing rules",
    "Manage export configurations",
    "Manage export hierarchy",
    "Import/export keys and translations"
];

const MANAGER_ACTIONS = [
    "Edit translations",
    "Manage keys",
    "Manage languages",
    "Manage post processing rules",
    "Manage export configurations",
    "Manage export hierarchy",
    "Import/export keys and translations",
    "Manage OTA releases",
    "Manage users",
    "Edit project/organization settings"
];

const OWNER_ACTIONS = [
    "Edit translations",
    "Manage keys",
    "Manage languages",
    "Manage post processing rules",
    "Manage export configurations",
    "Manage export hierarchy",
    "Import/export keys and translations",
    "Manage OTA releases",
    "Manage users",
    "Edit project/organization settings",
    "Delete project/organization",
    "Manage subscription"
];

export function RolesLegend(props: { style?: React.CSSProperties }) {
    return (
        <div style={{ display: "flex", alignItems: "center", ...props.style }}>
            Roles:
            <Tooltip
                placement="topLeft"
                title={
                    <div style={{ fontSize: 11 }}>
                        Translators can do the following:
                        <ul
                            style={{
                                margin: "8px 0 0",
                                listStyle: "unset",
                                listStyleType: "disc",
                                listStylePosition: "inside"
                            }}
                        >
                            {TRANSLATOR_ACTIONS.map((action) => {
                                return <ListElement key={action}>{action}</ListElement>;
                            })}
                        </ul>
                    </div>
                }
            >
                <Tag color={PermissionUtils.getColorByRole("translator")} style={{ marginLeft: 16 }}>
                    Translator
                </Tag>
            </Tooltip>
            <Tooltip
                placement="topLeft"
                title={
                    <div style={{ fontSize: 11 }}>
                        Developers can do the following:
                        <ul
                            style={{
                                margin: "8px 0 0",
                                listStyle: "unset",
                                listStyleType: "disc",
                                listStylePosition: "inside"
                            }}
                        >
                            {DEVELOPER_ACTIONS.map((action) => {
                                return <ListElement key={action}>{action}</ListElement>;
                            })}
                        </ul>
                    </div>
                }
            >
                <Tag color={PermissionUtils.getColorByRole("developer")} style={{ marginLeft: 8 }}>
                    Developer
                </Tag>
            </Tooltip>
            <Tooltip
                placement="topRight"
                title={
                    <div style={{ fontSize: 11 }}>
                        Managers can do the following:
                        <ul
                            style={{
                                margin: "8px 0 0",
                                listStyle: "unset",
                                listStyleType: "disc",
                                listStylePosition: "inside"
                            }}
                        >
                            {MANAGER_ACTIONS.map((action) => {
                                return <ListElement key={action}>{action}</ListElement>;
                            })}
                        </ul>
                    </div>
                }
            >
                <Tag color={PermissionUtils.getColorByRole("manager")} style={{ marginLeft: 8 }}>
                    Manager
                </Tag>
            </Tooltip>
            <Tooltip
                placement="topRight"
                title={
                    <div style={{ fontSize: 11 }}>
                        Owners can do the following:
                        <ul
                            style={{
                                margin: "8px 0 0",
                                listStyle: "unset",
                                listStyleType: "disc",
                                listStylePosition: "inside"
                            }}
                        >
                            {OWNER_ACTIONS.map((action) => {
                                return <ListElement key={action}>{action}</ListElement>;
                            })}
                        </ul>
                    </div>
                }
            >
                <Tag color={PermissionUtils.getColorByRole("owner")} style={{ marginLeft: 8 }}>
                    Owner
                </Tag>
            </Tooltip>
        </div>
    );
}
