import {
    HomeOutlined,
    LockOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ReloadOutlined,
    TeamOutlined,
    ToolOutlined
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { CollapseType } from "antd/lib/layout/Sider";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { SidebarTrigger } from "../../ui/SidebarTrigger";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";
const { Sider } = Layout;

interface INavigationData {
    icon: any;
    path: string;
    text: string;
    texterifyCloudOnly: boolean;
}

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    selectedItem: number;
}

@observer
class OrganizationSidebar extends React.Component<IProps, IState> {
    navigationData: INavigationData[] = [
        {
            icon: HomeOutlined,
            path: Routes.DASHBOARD.ORGANIZATION.replace(":organizationId", this.props.match.params.organizationId),
            text: "Overview",
            texterifyCloudOnly: false
        },
        {
            icon: TeamOutlined,
            path: Routes.DASHBOARD.ORGANIZATION_MEMBERS.replace(
                ":organizationId",
                this.props.match.params.organizationId
            ),
            text: "Members",
            texterifyCloudOnly: false
        },
        {
            icon: ToolOutlined,
            path: Routes.DASHBOARD.ORGANIZATION_SETTINGS.replace(
                ":organizationId",
                this.props.match.params.organizationId
            ),
            text: "Settings",
            texterifyCloudOnly: false
        },
        {
            icon: ReloadOutlined,
            path: Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION.replace(
                ":organizationId",
                this.props.match.params.organizationId
            ),
            text: "Subscription",
            texterifyCloudOnly: true
        }
    ];

    state: IState = {
        selectedItem: 0
    };

    renderMenuItems = (): JSX.Element[] => {
        return [
            <Menu.Item
                key={"title"}
                title={dashboardStore.currentOrganization && dashboardStore.currentOrganization.attributes.name}
                style={{ height: 48, display: "flex", alignItems: "center", padding: "0 24px", overflow: "hidden" }}
            >
                <Link
                    to={Routes.DASHBOARD.ORGANIZATION.replace(
                        ":organizationId",
                        dashboardStore.currentOrganization && dashboardStore.currentOrganization.id
                    )}
                    style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                >
                    <span style={{ fontWeight: "bold" }}>
                        {!dashboardStore.sidebarMinimized &&
                            dashboardStore.currentOrganization &&
                            dashboardStore.currentOrganization.attributes.name}
                        {dashboardStore.sidebarMinimized &&
                            dashboardStore.currentOrganization &&
                            dashboardStore.currentOrganization.attributes.name.substr(0, 2)}
                    </span>
                </Link>
            </Menu.Item>,
            ...this.navigationData
                .filter((data) => {
                    if (data.texterifyCloudOnly && !IS_TEXTERIFY_CLOUD) {
                        return false;
                    } else {
                        return true;
                    }
                })
                .map((data: INavigationData, index: number) => {
                    return (
                        <Menu.Item key={index} title={data.text}>
                            <Link to={data.path}>
                                <data.icon />
                                <span>{data.text}</span>
                            </Link>
                        </Menu.Item>
                    );
                })
        ];
    };

    getSelectedItem = (): string[] => {
        return this.navigationData.map((data: INavigationData, index: number): string => {
            if (data.path === this.props.location.pathname) {
                return index.toString();
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

export { OrganizationSidebar };
