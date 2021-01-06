import { LockOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";

interface INavigationData {
    icon: any;
    path: string;
    text: string;
    texterifyCloudOnly: boolean;
}

type IProps = RouteComponentProps;
interface IState {
    selectedItem: number;
}

class UserSettingsSidebar extends React.Component<IProps, IState> {
    navigationData: INavigationData[] = [
        {
            icon: UserOutlined,
            path: Routes.USER.SETTINGS.ACCOUNT,
            text: "Account",
            texterifyCloudOnly: false
        },
        {
            icon: LockOutlined,
            path: Routes.USER.SETTINGS.ACCESS_TOKENS,
            text: "Access tokens",
            texterifyCloudOnly: false
        },
        {
            icon: SolutionOutlined,
            path: Routes.USER.SETTINGS.LICENSES,
            text: "Licenses",
            texterifyCloudOnly: true
        }
    ];

    state: IState = {
        selectedItem: 0
    };

    renderMenuItems = (): JSX.Element[] => {
        return this.navigationData
            .filter((data) => {
                if (data.texterifyCloudOnly && !IS_TEXTERIFY_CLOUD) {
                    return false;
                } else {
                    return true;
                }
            })
            .map((data: INavigationData, index: number) => {
                return (
                    <Menu.Item key={index}>
                        <data.icon />
                        <Link to={data.path}>{data.text}</Link>
                    </Menu.Item>
                );
            });
    };

    getSelectedItem = (): string[] => {
        return this.navigationData.map((data: INavigationData, index: number): string => {
            if (data.path === this.props.location.pathname) {
                return index.toString();
            }
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
                    <Menu mode="inline" selectedKeys={this.getSelectedItem()} style={{ height: "100%" }}>
                        {this.renderMenuItems()}
                    </Menu>
                </Layout.Sider>
            </>
        );
    }
}

export { UserSettingsSidebar };
