import { Layout, Menu } from "antd";
import { CollapseType } from "antd/lib/layout/Sider";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import styled from "styled-components";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Styles } from "../../ui/Styles";
import { HomeOutlined, TeamOutlined, ToolOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
const { Sider } = Layout;

const SidebarTrigger = styled.div`
    width: 100%;
    height: 100%;
    background: #fff;
    color: #333;
    border-right: 1px solid #e8e8e8;
    transition: 0.2s all;

    &:hover {
        color: ${Styles.COLOR_PRIMARY};
        background: ${Styles.COLOR_PRIMARY_LIGHT};
    }
`;

interface INavigationData {
    icon: any;
    path: string;
    text: string;
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
            text: "Overview"
        },
        {
            icon: TeamOutlined,
            path: Routes.DASHBOARD.ORGANIZATION_MEMBERS.replace(
                ":organizationId",
                this.props.match.params.organizationId
            ),
            text: "Members"
        },
        {
            icon: ToolOutlined,
            path: Routes.DASHBOARD.ORGANIZATION_SETTINGS.replace(
                ":organizationId",
                this.props.match.params.organizationId
            ),
            text: "Settings"
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
                    className="nav-text"
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
            ...this.navigationData.map((data: INavigationData, index: number) => {
                return (
                    <Menu.Item key={index} title={data.text}>
                        <Link to={data.path} className="nav-text">
                            <data.icon className="nav-text" style={{ marginRight: 8 }} />
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
            <SidebarTrigger
                style={{
                    background: dashboardStore.sidebarMinimized ? Styles.COLOR_PRIMARY_LIGHT : undefined,
                    color: dashboardStore.sidebarMinimized ? Styles.COLOR_PRIMARY : undefined
                }}
            >
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
                    style={{ boxShadow: "rgba(61, 172, 206, 0.05) 0px 0px 24px" }}
                >
                    <Menu
                        mode="inline"
                        selectedKeys={this.getSelectedItem()}
                        style={{ height: "100%" }}
                        className="dashboard-sidebar-menu"
                    >
                        {this.renderMenuItems()}
                    </Menu>
                </Sider>
            </>
        );
    }
}

export { OrganizationSidebar };
