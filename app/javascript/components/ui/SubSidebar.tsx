import { Menu, MenuItemProps, SubMenuProps } from "antd";
import { Location } from "history";
import * as React from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";

interface IElementData {
    title: React.ReactNode;
    path: string;
    dataId: string;
    disabled?: boolean;
    texterifyInstanceOnly?: boolean;
}

type CustomMenuItemProps = MenuItemProps;

const MenuItem: typeof Menu.Item & CustomMenuItemProps = styled(Menu.Item)<CustomMenuItemProps>`
    position: relative;
    background: transparent !important;

    > a,
    > div {
        display: inline-block;
        width: 100%;
        color: ${(props: CustomMenuItemProps) => {
            return props.selectedKeys.includes(props["data-id"])
                ? "var(--sidebar-item-active-color) !important"
                : "var(--sidebar-item-color)";
        }};
        padding: 0 12px;
        background: ${(props: CustomMenuItemProps) => {
            return props.selectedKeys.includes(props["data-id"])
                ? "var(--sidebar-item-active-background-color)"
                : undefined;
        }};
        border-radius: ${(props: CustomMenuItemProps) => {
            return props["data-no-border-radius"] ? "0" : "4px";
        }};
        letter-spacing: 0.25px;
        font-weight: normal !important;

        &:hover {
            color: ${(props: CustomMenuItemProps) => {
                return props.selectedKeys.includes(props["data-id"])
                    ? "var(--sidebar-item-active-color) !important"
                    : "var(--sidebar-item-color-hover)";
            }};
        }
    }
`;

const SubMenu: typeof Menu.Item = styled(Menu.SubMenu)<SubMenuProps>`
    > div {
        background: transparent !important;
    }

    a {
        display: inline-block;
        width: 100%;
        color: ${(props: MenuItemProps) => {
            return props.selectedKeys.includes(props["data-id"])
                ? "var(--sidebar-item-active-color) !important"
                : "var(--sidebar-item-color)";
        }};
        padding: 0 12px;
        background: ${(props: SubMenuProps & { selectedKeys: string[] }) => {
            return props.selectedKeys.includes(props["data-id"])
                ? "var(--sidebar-item-active-background-color)"
                : undefined;
        }};
        border-radius: 4px !important;
        letter-spacing: 0.25px;
        font-weight: normal !important;

        &:hover {
            color: ${(props: MenuItemProps) => {
                return props.selectedKeys.includes(props["data-id"])
                    ? "var(--sidebar-item-active-color) !important"
                    : "var(--sidebar-item-color-hover)";
            }};
        }
    }
`;

export interface ISubSidebarProps {
    menuItems: {
        menuTitle: string;
        items: {
            subMenuTitle?: string;
            subMenuPath?: string;
            subMenuDataId?: string;
            paths: IElementData[];
        }[];
    }[];
}

function getSelectedMenuItems(items: ISubSidebarProps["menuItems"][0]["items"], currentLocation: Location) {
    const selectedItems = [];
    items.forEach((data) => {
        if (data.subMenuPath) {
            if (currentLocation.pathname.startsWith(data.subMenuPath)) {
                selectedItems.push(data.subMenuDataId);
            }
        }

        data.paths.forEach((path) => {
            if (currentLocation.pathname.startsWith(path.path)) {
                selectedItems.push(path.dataId);
            }
        });
    });

    return selectedItems;
}

export function SubSidebar(props: ISubSidebarProps) {
    const location = useLocation();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                padding: "32px 0",
                background: "var(--sidebar-background-color)",
                borderRight: "1px solid var(--sidebar-border-color)",
                minWidth: 200,
                flexShrink: 0
            }}
        >
            {props.menuItems.map((menuItem, index) => {
                return (
                    <div key={menuItem.menuTitle}>
                        <h4 style={{ fontWeight: "bold", padding: "0 24px", margin: 0, marginTop: index > 0 ? 24 : 0 }}>
                            {menuItem.menuTitle}
                        </h4>
                        <Menu
                            style={{ marginTop: 16, borderRight: 0, background: "var(--sidebar-background-color)" }}
                            selectedKeys={getSelectedMenuItems(menuItem.items, location)}
                        >
                            {menuItem.items.map((item) => {
                                const isSubMenu = item.paths.length > 1;

                                const menuElements = item.paths.map((path) => {
                                    return (
                                        <MenuItem
                                            data-id={path.dataId}
                                            key={path.dataId}
                                            title={path.title}
                                            disabled={path.disabled}
                                            style={
                                                isSubMenu
                                                    ? {
                                                          padding: 0,
                                                          borderRadius: 0,
                                                          margin: 0
                                                      }
                                                    : undefined
                                            }
                                            data-no-border-radius={isSubMenu}
                                        >
                                            <Link to={path.path}>{path.title}</Link>
                                        </MenuItem>
                                    );
                                });

                                if (isSubMenu) {
                                    return (
                                        <SubMenu
                                            title={<Link to={item.subMenuPath}>{item.subMenuTitle}</Link>}
                                            data-id={item.subMenuDataId}
                                            key={item.subMenuDataId}
                                        >
                                            {menuElements}
                                        </SubMenu>
                                    );
                                } else {
                                    return menuElements;
                                }
                            })}
                        </Menu>
                    </div>
                );
            })}
        </div>
    );
}
