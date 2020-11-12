import {
    BlockOutlined,
    ClusterOutlined,
    DownloadOutlined,
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
import { ROLES_DEVELOPER_UP, ROLES_MANAGER_UP } from "../../utilities/PermissionUtils";
const { Sider } = Layout;

interface INavigationData {
    icon: any;
    path?: string;
    text?: string;
    roles?: string[];
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
                text: "Overview"
            },
            {
                icon: KeyOutlined,
                path: Routes.DASHBOARD.PROJECT_KEYS.replace(":projectId", this.props.match.params.projectId),
                text: "Keys"
            },
            {
                icon: GlobalOutlined,
                path: Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", this.props.match.params.projectId),
                text: "Languages"
            },
            {
                icon: ImportOutlined,
                path: Routes.DASHBOARD.PROJECT_IMPORT.replace(":projectId", this.props.match.params.projectId),
                text: "Import",
                roles: ROLES_DEVELOPER_UP
            },
            {
                icon: ExportOutlined,
                text: "Export",
                roles: ROLES_DEVELOPER_UP,
                subItems: [
                    {
                        icon: DownloadOutlined,
                        path: Routes.DASHBOARD.PROJECT_EXPORT.replace(":projectId", this.props.match.params.projectId),
                        text: "Download",
                        roles: ROLES_DEVELOPER_UP
                    },
                    {
                        icon: SettingOutlined,
                        path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                            ":projectId",
                            this.props.match.params.projectId
                        ),
                        text: "Configurations",
                        roles: ROLES_DEVELOPER_UP
                    },
                    {
                        icon: ClusterOutlined,
                        path: Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY.replace(
                            ":projectId",
                            this.props.match.params.projectId
                        ),
                        text: "Hierarchy",
                        roles: ROLES_DEVELOPER_UP
                    }
                ]
            },
            {
                icon: LineChartOutlined,
                path: Routes.DASHBOARD.PROJECT_ACTIVITY.replace(":projectId", this.props.match.params.projectId),
                text: "Activity"
            },
            // {
            //     icon: MonitorOutlined,
            //     path: Routes.DASHBOARD.PROJECT_VALIDATIONS.replace(":projectId", this.props.match.params.projectId),
            //     text: "Validations"
            // },
            {
                icon: SwapOutlined,
                path: Routes.DASHBOARD.PROJECT_OTA.replace(":projectId", this.props.match.params.projectId),
                text: "Over the Air"
            },
            {
                icon: OneToOneOutlined,
                path: Routes.DASHBOARD.PROJECT_POST_PROCESSING.replace(":projectId", this.props.match.params.projectId),
                text: "Post Processing"
            },
            {
                icon: TeamOutlined,
                path: Routes.DASHBOARD.PROJECT_MEMBERS.replace(":projectId", this.props.match.params.projectId),
                text: "Members"
            },
            {
                icon: BlockOutlined,
                path: Routes.DASHBOARD.PROJECT_INTEGRATIONS.replace(":projectId", this.props.match.params.projectId),
                text: "Integrations",
                roles: ROLES_DEVELOPER_UP
            },
            {
                icon: SettingOutlined,
                path: Routes.DASHBOARD.PROJECT_SETTINGS.replace(":projectId", this.props.match.params.projectId),
                text: "Settings",
                roles: ROLES_MANAGER_UP
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
                    overflow: "hidden"
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
                            dashboardStore.currentProject.attributes.name.substr(0, 2)}
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
                    <Menu.Item key={index} title={data.text} disabled={!this.isMenuItemEnabled(data.roles)}>
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
                    breakpoint="md"
                    defaultCollapsed={dashboardStore.sidebarMinimized}
                    collapsed={dashboardStore.sidebarMinimized}
                    onCollapse={this.onCollapse}
                    trigger={this.renderSidebarTrigger()}
                    style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 24px" }}
                >
                    <Menu mode="inline" selectedKeys={this.getSelectedItem()} style={{ height: "100%" }}>
                        {this.renderMenuItems()}
                    </Menu>
                </Sider>
            </>
        );
    }
}

export { ProjectSidebar };
