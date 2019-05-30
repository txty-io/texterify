import { Avatar, Breadcrumb, Button, Icon, Layout, Menu, Popover } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter, Link, Route, RouteComponentProps, Switch } from "react-router-dom";
import styled from "styled-components";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
const { Header, Content, Footer, Sider } = Layout;
import * as _ from "lodash";

interface INavigationData {
  icon: string;
  path: string;
  text: string;
}

type IProps = RouteComponentProps<{}> & {};
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

  constructor(props: IProps) {
    super(props);

    this.state = {
      selectedItem: 0
    };
  }

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

  render(): JSX.Element {
    return (
      <>
        <div className="logo" />
        <Sider
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
        </Sider>
      </>
    );
  }
}

export { UserSettingsSidebar };
