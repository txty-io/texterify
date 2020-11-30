import { FileTextOutlined, HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ToolOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { CollapseType } from "antd/lib/layout/Sider";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { SidebarTrigger } from "../../ui/SidebarTrigger";
const { Sider } = Layout;

interface INavigationData {
    icon: any;
    path: string;
    text: string;
}

type IProps = RouteComponentProps<{}>;
interface IState {
    selectedItem: number;
}

@observer
class InstanceSidebar extends React.Component<IProps, IState> {
    navigationData: INavigationData[] = [
        {
            icon: HomeOutlined,
            path: Routes.DASHBOARD.INSTANCE.ROOT,
            text: "Overview"
        },
        {
            icon: FileTextOutlined,
            path: Routes.DASHBOARD.INSTANCE.LICENSES,
            text: "Licenses"
        },
        {
            icon: ToolOutlined,
            path: Routes.DASHBOARD.INSTANCE.SETTINGS,
            text: "Settings"
        }
    ];

    state: IState = {
        selectedItem: 0
    };

    renderMenuItems = () => {
        return this.navigationData.map((data: INavigationData, index: number) => {
            return (
                <Menu.Item key={index} title={data.text}>
                    <Link to={data.path}>
                        <data.icon />
                        <span>{data.text}</span>
                    </Link>
                </Menu.Item>
            );
        });
    };

    getSelectedItem = () => {
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

export { InstanceSidebar };
