import {
    BlockOutlined,
    ClusterOutlined,
    DownloadOutlined,
    EditOutlined,
    ExportOutlined,
    GlobalOutlined,
    HomeOutlined,
    ImportOutlined,
    KeyOutlined,
    LineChartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    MonitorOutlined,
    OneToOneOutlined,
    SettingOutlined,
    SwapOutlined,
    TeamOutlined
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { CollapseType } from "antd/lib/layout/Sider";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { SidebarTrigger } from "../../ui/SidebarTrigger";
import { ROLES_DEVELOPER_UP, ROLES_MANAGER_UP, ROLES_TRANSLATOR_UP } from "../../utilities/PermissionUtils";
const { Sider } = Layout;

interface INavigationData {
    icon: any;
    path?: string;
    text?: string;
    roles?: string[];
    dataId: string;
    subItems?: INavigationData[];
}

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    selectedItem: number;
}

@observer
class ProjectSidebar extends React.Component<IProps, IState> {
    state: IState = {
        selectedItem: 0
    };

    getNavigationData(): INavigationData[] {
        return [
            {
                icon: HomeOutlined,
                path: Routes.DASHBOARD.PROJECT.replace(":projectId", this.props.match.params.projectId),
                text: "Home",
                dataId: "project-sidebar-home"
            },
            {
                icon: KeyOutlined,
                path: Routes.DASHBOARD.PROJECT_KEYS.replace(":projectId", this.props.match.params.projectId),
                text: "Keys",
                dataId: "project-sidebar-keys"
            },
            {
                icon: GlobalOutlined,
                path: Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", this.props.match.params.projectId),
                text: "Languages",
                dataId: "project-sidebar-languages"
            },
            {
                icon: EditOutlined,
                path: Routes.DASHBOARD.PROJECT_EDITOR.replace(":projectId", this.props.match.params.projectId),
                text: "Editor",
                dataId: "project-sidebar-editor"
            },
            {
                icon: ImportOutlined,
                path: Routes.DASHBOARD.PROJECT_IMPORT.replace(":projectId", this.props.match.params.projectId),
                text: "Import",
                roles: ROLES_DEVELOPER_UP,
                dataId: "project-sidebar-import"
            },
            {
                icon: ExportOutlined,
                text: "Export",
                roles: ROLES_DEVELOPER_UP,
                dataId: "project-sidebar-export",
                subItems: [
                    {
                        icon: DownloadOutlined,
                        path: Routes.DASHBOARD.PROJECT_EXPORT.replace(":projectId", this.props.match.params.projectId),
                        text: "Download",
                        roles: ROLES_DEVELOPER_UP,
                        dataId: "project-sidebar-download"
                    },
                    {
                        icon: SettingOutlined,
                        path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                            ":projectId",
                            this.props.match.params.projectId
                        ),
                        text: "Configurations",
                        roles: ROLES_DEVELOPER_UP,
                        dataId: "project-sidebar-configurations"
                    },
                    {
                        icon: ClusterOutlined,
                        path: Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY.replace(
                            ":projectId",
                            this.props.match.params.projectId
                        ),
                        text: "Hierarchy",
                        roles: ROLES_DEVELOPER_UP,
                        dataId: "project-sidebar-hierarchy"
                    }
                ]
            },
            {
                icon: LineChartOutlined,
                path: Routes.DASHBOARD.PROJECT_ACTIVITY.replace(":projectId", this.props.match.params.projectId),
                text: "Activity",
                dataId: "project-sidebar-activity"
            },
            {
                icon: MonitorOutlined,
                path: Routes.DASHBOARD.PROJECT_VALIDATIONS.replace(":projectId", this.props.match.params.projectId),
                text: "Validations",
                dataId: "project-sidebar-validations"
            },
            {
                icon: SwapOutlined,
                path: Routes.DASHBOARD.PROJECT_OTA.replace(":projectId", this.props.match.params.projectId),
                text: "Over the Air",
                roles: ROLES_DEVELOPER_UP,
                dataId: "project-sidebar-ota"
            },
            {
                icon: OneToOneOutlined,
                path: Routes.DASHBOARD.PROJECT_POST_PROCESSING.replace(":projectId", this.props.match.params.projectId),
                text: "Post Processing",
                dataId: "project-sidebar-post-processing"
            },
            {
                icon: TeamOutlined,
                path: Routes.DASHBOARD.PROJECT_MEMBERS.replace(":projectId", this.props.match.params.projectId),
                text: "Members",
                dataId: "project-sidebar-members"
            },
            {
                icon: BlockOutlined,
                path: Routes.DASHBOARD.PROJECT_INTEGRATIONS.replace(":projectId", this.props.match.params.projectId),
                text: "Integrations",
                roles: ROLES_TRANSLATOR_UP,
                dataId: "project-sidebar-integrations"
            },
            {
                icon: SettingOutlined,
                path: Routes.DASHBOARD.PROJECT_SETTINGS.replace(":projectId", this.props.match.params.projectId),
                text: "Settings",
                roles: ROLES_MANAGER_UP,
                dataId: "project-sidebar-settings"
            }
        ];
    }

    isMenuItemEnabled = (requiredRoles: string[]) => {
        if (!requiredRoles) {
            return true;
        }

        const role = dashboardStore.getCurrentRole();

        return requiredRoles.includes(role);
    };

    renderMenuItems = () => {
        return [
            <Menu.Item
                key="title"
                title={dashboardStore.currentProject && dashboardStore.currentProject.attributes.name}
                style={{
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: dashboardStore.sidebarMinimized ? "center" : undefined
                }}
            >
                <Link
                    to={Routes.DASHBOARD.PROJECT.replace(
                        ":projectId",
                        dashboardStore.currentProject && dashboardStore.currentProject.id
                    )}
                    style={{ overflow: "hidden", textOverflow: "ellipsis", color: "var(--highlight-color)" }}
                >
                    <span style={{ fontWeight: "bold" }}>
                        {!dashboardStore.sidebarMinimized &&
                            dashboardStore.currentProject &&
                            dashboardStore.currentProject.attributes.name}
                        {dashboardStore.sidebarMinimized &&
                            dashboardStore.currentProject &&
                            dashboardStore.currentProject.attributes.name.substr(0, 1)}
                    </span>
                </Link>
            </Menu.Item>,
            ...this.getNavigationData().map((data: INavigationData, index: number) => {
                if (data.subItems) {
                    return (
                        <Menu.SubMenu
                            key={index}
                            disabled={!this.isMenuItemEnabled(data.roles)}
                            title={
                                <div>
                                    <data.icon />
                                    <span>{data.text}</span>
                                </div>
                            }
                            onTitleClick={() => {
                                history.push(data.subItems[0].path);
                            }}
                        >
                            {data.subItems.map((subMenuItem, submenuIndex) => {
                                return (
                                    <Menu.Item
                                        key={`${index}-${submenuIndex}`}
                                        disabled={!this.isMenuItemEnabled(subMenuItem.roles)}
                                    >
                                        <Link to={subMenuItem.path}>
                                            <subMenuItem.icon />
                                            <span>{subMenuItem.text}</span>
                                        </Link>
                                    </Menu.Item>
                                );
                            })}
                        </Menu.SubMenu>
                    );
                }

                const menuItem = (
                    <Link to={data.path}>
                        <data.icon />
                        <span>{data.text}</span>
                    </Link>
                );

                return (
                    <Menu.Item
                        data-id={data.dataId}
                        key={index}
                        title={data.text}
                        disabled={!this.isMenuItemEnabled(data.roles)}
                    >
                        {menuItem}
                    </Menu.Item>
                );
            })
        ];
    };

    getSelectedItem = (): string[] => {
        return this.getNavigationData().map((data: INavigationData, index: number): string => {
            if (data.path === this.props.location.pathname) {
                return index.toString();
            }

            if (data.subItems) {
                let foundIndex;

                data.subItems.forEach((item, submenuIndex) => {
                    if (item.path === this.props.location.pathname) {
                        foundIndex = `${index}-${submenuIndex}`;
                    }
                });

                if (index) {
                    return foundIndex;
                }
            }
        });
    };

    onCollapse = (collapsed: boolean, type: CollapseType) => {
        if (type === "clickTrigger") {
            dashboardStore.sidebarMinimized = collapsed;
        }

        // Fix sidebar somehow not collapsing correctly.
        if (collapsed) {
            const sidebarMenu = document.getElementById("sidebar-menu");
            setTimeout(() => {
                if (sidebarMenu) {
                    sidebarMenu.classList.remove("ant-menu-inline");
                    sidebarMenu.classList.add("ant-menu-vertical");

                    const menuItems = (sidebarMenu.querySelectorAll(".ant-menu-item") as unknown) as HTMLElement[];
                    menuItems.forEach((menuItem) => {
                        menuItem.style.removeProperty("padding-left");
                    });

                    const submenuItems = (sidebarMenu.querySelectorAll(
                        ".ant-menu-submenu .ant-menu-submenu-title"
                    ) as unknown) as HTMLElement[];
                    submenuItems.forEach((submenuItem) => {
                        submenuItem.style.removeProperty("padding-left");
                    });
                }
            });
        }
    };

    renderSidebarTrigger = () => {
        return (
            <SidebarTrigger>
                {dashboardStore.sidebarMinimized ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </SidebarTrigger>
        );
    };

    render() {
        return (
            <>
                <div className="logo" />
                <Sider
                    collapsible
                    defaultCollapsed={dashboardStore.sidebarMinimized}
                    collapsed={dashboardStore.sidebarMinimized}
                    onCollapse={this.onCollapse}
                    trigger={this.renderSidebarTrigger()}
                    style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 24px" }}
                >
                    <Menu
                        id="sidebar-menu"
                        mode="inline"
                        selectedKeys={this.getSelectedItem()}
                        style={{ height: "100%" }}
                    >
                        {this.renderMenuItems()}
                    </Menu>
                </Sider>
            </>
        );
    }
}

export { ProjectSidebar };
