import { Icon, Layout, Menu } from "antd";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { Routes } from "../../routing/Routes";

interface INavigationData {
  icon: string;
  path: string;
  text: string;
}

type IProps = RouteComponentProps;
interface IState {
  selectedItem: number;
}

class UserSettingsSidebar extends React.Component<IProps, IState> {
  navigationData: INavigationData[] = [
    {
      icon: "user",
      path: Routes.USER.SETTINGS.ACCOUNT,
      text: "Account"
    },
    {
      icon: "lock",
      path: Routes.USER.SETTINGS.ACCESS_TOKENS,
      text: "Access tokens"
    }
  ];

  state: IState = {
    selectedItem: 0
  };

  renderMenuItems = (): JSX.Element[] => {
    return this.navigationData.map((data: INavigationData, index: number) => {
      return (
        <Menu.Item key={index}>
          <Icon type={data.icon} className="nav-text" />
          <Link to={data.path} className="nav-text">
            {data.text}
          </Link>
        </Menu.Item>
      );
    });
  }

  getSelectedItem = (): string[] => {
    return this.navigationData.map((data: INavigationData, index: number): string => {
      if (data.path === this.props.location.pathname) {
        return index.toString();
      }
    });
  }

  render() {
    return (
      <>
        <div className="logo" />
        <Layout.Sider
          breakpoint="md"
          collapsedWidth="0"
          id="sidebar"
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
        </Layout.Sider>
      </>
    );
  }
}

export { UserSettingsSidebar };
