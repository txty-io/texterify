import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../routing/Routes";
import styled from "styled-components";
import { useLocation } from "react-router";
import { Tag } from "antd";

const SidebarListItem = styled.li<{ active: boolean }>`
    position: relative;

    &:before {
        position: absolute;
        content: "";
        display: ${(props) => {
            return props.active ? "block" : "none";
        }};
        top: 7px;
        height: 20px;
        width: 4px;
        background: var(--sidebar-item-active-border-color);
        border-radius: 0px 2px 2px 0px;
    }

    a {
        color: ${(props) => {
            return props.active ? "var(--sidebar-item-active-color)" : "var(--sidebar-item-color)";
        }};
        display: inline-block;
        width: 100%;

        &:hover {
            color: var(--sidebar-item-color-hover);
        }
    }
`;

export function ImportSidebar(props: { projectId: string }) {
    const location = useLocation();

    function getMenuItems() {
        return [
            {
                path: Routes.DASHBOARD.PROJECT_IMPORT_FILE,
                name: "File"
            },
            {
                path: Routes.DASHBOARD.PROJECT_IMPORT_WORDPRESS,
                name: "WordPress"
            },
            {
                path: Routes.DASHBOARD.PROJECT_IMPORT_GITHUB,
                disabled: true,
                name: (
                    <>
                        GitHub <Tag style={{ marginLeft: 8 }}>coming soon</Tag>
                    </>
                )
            }
        ];
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "32px 0",
                background: "var(--sidebar-background-color)",
                borderRight: "1px solid var(--sidebar-border-color)",
                minWidth: 200
            }}
        >
            <h4 style={{ fontWeight: "bold", padding: "0 24px", margin: 0 }}>Import</h4>
            <ul style={{ marginTop: 16 }}>
                {getMenuItems().map((item) => {
                    return (
                        <SidebarListItem
                            key={item.name}
                            active={item.path.replace(":projectId", props.projectId) === location.pathname}
                            style={{
                                pointerEvents: item.disabled ? "none" : undefined,
                                opacity: item.disabled ? 0.5 : undefined
                            }}
                        >
                            <Link style={{ padding: "8px 24px" }} to={item.path.replace(":projectId", props.projectId)}>
                                {item.name}
                            </Link>
                        </SidebarListItem>
                    );
                })}
            </ul>
        </div>
    );
}
