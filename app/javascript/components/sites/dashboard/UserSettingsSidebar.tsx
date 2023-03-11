import { InfoCircleOutlined, LockOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { IS_CLOUD } from "../../utilities/Env";

interface INavigationData {
    icon: any;
    path: string;
    text: string;
    cloudOnly: boolean;
    dataId: string;
}

type IProps = RouteComponentProps;

class UserSettingsSidebar extends React.Component<IProps> {
    navigationData: INavigationData[] = [
        {
            icon: UserOutlined,
            path: Routes.USER.SETTINGS.ACCOUNT,
            text: "Account",
            cloudOnly: false,
            dataId: "user-sidebar-account"
        },
        {
            icon: LockOutlined,
            path: Routes.USER.SETTINGS.ACCESS_TOKENS,
            text: "Access tokens",
            cloudOnly: false,
            dataId: "user-sidebar-access-tokens"
        },
        {
            icon: SolutionOutlined,
            path: Routes.USER.SETTINGS.LICENSES,
            text: "Get a license",
            cloudOnly: true,
            dataId: "user-sidebar-licenses"
        },
        {
            icon: InfoCircleOutlined,
            path: Routes.USER.SETTINGS.ABOUT,
            text: "About",
            cloudOnly: false,
            dataId: "user-sidebar-about"
        }
    ];

    getFilteredNavigationData = () => {
        return this.navigationData.filter((data) => {
            if (data.cloudOnly) {
                if (IS_CLOUD) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        });
    };

    renderMenuItems = () => {
        return this.getFilteredNavigationData().map((data: INavigationData, index: number) => {
            return (
                <Menu.Item data-id={data.dataId} key={index}>
                    <data.icon />
                    <Link to={data.path}>{data.text}</Link>
                </Menu.Item>
            );
        });
    };

    getSelectedItems = () => {
        return this.getFilteredNavigationData()
            .map((data: INavigationData, index: number): string => {
                if (data.path === this.props.location.pathname) {
                    return index.toString();
                }
            })
            .filter((item) => {
                return item !== undefined;
            });
    };

    render() {
        return (
            <>
                <div className="logo" />
                <Layout.Sider
                    breakpoint="md"
                    collapsedWidth="0"
                    id="sidebar"
                    style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 0px 24px" }}
                >
                    <Menu mode="inline" selectedKeys={this.getSelectedItems()} style={{ height: "100%" }}>
                        {this.renderMenuItems()}
                    </Menu>
                </Layout.Sider>
            </>
        );
    }
}

export { UserSettingsSidebar };
