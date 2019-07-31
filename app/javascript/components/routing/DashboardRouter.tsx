import { Avatar, Icon, Layout, Popover } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, Redirect, RouteComponentProps, Switch } from "react-router-dom";
import styled from "styled-components";
import { AuthAPI } from "../api/v1/AuthAPI";
import { ActivitySite } from "../sites/dashboard/ActivitySite";
import { DashboardSite } from "../sites/dashboard/DashboardSite";
import { NotFoundSite } from "../sites/dashboard/NotFoundSite";
import { ProjectSidebar } from "../sites/dashboard/ProjectSidebar";
import { ProjectsSite } from "../sites/dashboard/ProjectsSite";
import { UserAccessTokensSettingsSite } from "../sites/dashboard/UserAccessTokensSettingsSite";
import { UserAccountSettingsSite } from "../sites/dashboard/UserAccountSettingsSite";
import { UserSettingsSidebar } from "../sites/dashboard/UserSettingsSidebar";
import { authStore } from "../stores/AuthStore";
import { Styles } from "../ui/Styles";
import { UserAvatar } from "../ui/UserAvatar";
import { PrivateRoute } from "./PrivateRoute";
import { ProjectRouter } from "./ProjectRouter";
import { Routes } from "./Routes";
const { Header } = Layout;

type IProps = RouteComponentProps & {};
interface IState {
  hasSidebar: boolean;
  accountMenuVisible: boolean;
}

const AccountProfileContentWrapper: any = styled.div`
  a {
    display: block;
    color: #888;
    padding: 4px 16px;
    background: #fcfcfc;
  }

  a:hover {
    text-decoration: none;
    background: #fcfcfc;
    color: #333;
  }
`;

@observer
class DashboardRouter extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      hasSidebar: false,
      accountMenuVisible: false
    };
  }

  componentDidMount(): void {
    this.setState({
      hasSidebar: this.hasSidebar()
    });
  }

  componentDidUpdate(): void {
    if (this.state.hasSidebar !== this.hasSidebar()) {
      this.setState({
        hasSidebar: this.hasSidebar()
      });
    }
  }

  logout = async (): Promise<void> => {
    await AuthAPI.logout();
    this.props.history.push(Routes.AUTH.LOGIN);
  }

  hasSidebar = (): boolean => {
    return !!document.getElementById("sidebar");
  }

  renderSidebar = (): JSX.Element => {
    return (
      <Switch>
        <PrivateRoute path={Routes.USER.SETTINGS.ROOT} component={UserSettingsSidebar} />
        <PrivateRoute path={Routes.DASHBOARD.PROJECT} component={ProjectSidebar} />
      </Switch>
    );
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    return (
      <>
        <Layout>
          <Header style={{ padding: "0 24px", display: "flex", alignItems: "center", borderBottom: "1px solid #e8e8e8", zIndex: 10 }}>
            <Link to={Routes.DASHBOARD.ROOT} style={{ textDecoration: "none" }}>
              <h1 style={{ fontSize: 24, marginBottom: 0, marginRight: 24, textDecoration: "none", fontFamily: "Pacifico" }}>Texterify</h1>
            </Link>
            <ul className="dashboard-main-menu" style={{ marginBottom: 0, marginRight: 24, display: "flex", alignItems: "center", flexGrow: 1 }}>
              <li>
                {/* <Link
                  to={Routes.DASHBOARD.ROOT}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.ROOT ? Styles.COLOR_PRIMARY : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.ROOT ? "#fff" : "#333",
                    transition: "none",
                    marginRight: 8,
                    fontWeight: "bold"
                  }}
                >
                  <Icon type="appstore" style={{ marginRight: 8 }} /> Dashboard
                </Link> */}
                <Link
                  to={Routes.DASHBOARD.PROJECTS}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS ? Styles.COLOR_PRIMARY : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS ? "#fff" : "#333",
                    transition: "none",
                    marginRight: 8,
                    textDecoration: "none"
                  }}
                >
                  <Icon type="project" style={{ marginRight: 8 }} /> Projects
                </Link>
                <Link
                  to={Routes.DASHBOARD.ACTIVITY}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY ? Styles.COLOR_PRIMARY : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY ? "#fff" : "#333",
                    transition: "none",
                    textDecoration: "none"
                  }}
                >
                  <Icon type="line-chart" style={{ marginRight: 8 }} /> Activity
                </Link>
              </li>
              {/* <li style={{ marginLeft: "auto" }}>
                <Link
                  to={Routes.OTHER.TOOLS}
                  style={{
                    background: this.props.history.location.pathname === Routes.OTHER.TOOLS ? Styles.COLOR_PRIMARY : undefined,
                    color: this.props.history.location.pathname === Routes.OTHER.TOOLS ? "#fff" : "#333",
                    transition: "none"
                  }}
                >
                  Tools & Integrations
                </Link>
              </li> */}
            </ul>
            <div
              onClick={() => { this.setState({ accountMenuVisible: true }); }}
              role="button"
              style={{ cursor: "pointer" }}
            >
              <Popover
                title="Account"
                placement="bottomRight"
                trigger="click"
                visible={this.state.accountMenuVisible}
                onVisibleChange={() => { this.setState({ accountMenuVisible: false }); }}
                content={
                  <AccountProfileContentWrapper>
                    <ul>
                      <li role="button" onClick={(e) => { e.stopPropagation(); this.setState({ accountMenuVisible: false }); }}>
                        <Link to={Routes.USER.SETTINGS.ACCOUNT}>
                          <Icon type="setting" style={{ marginRight: 5, fontWeight: "bold" }} />
                          Settings
                          </Link>
                      </li>
                      <li>
                        {/* tslint:disable-next-line:react-a11y-anchors */}
                        <a
                          role="button"
                          onClick={this.logout}
                        >
                          <Icon type="logout" style={{ marginRight: 5, fontWeight: "bold" }} />
                          Logout
                        </a>
                      </li>
                    </ul>
                  </AccountProfileContentWrapper>}
              >
                <div style={{ display: "flex" }}>
                  <UserAvatar user={authStore.currentUser} />
                  <div
                    style={{
                      padding: "0 16px",
                      borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold"
                    }}
                  >
                    {authStore.currentUser && authStore.currentUser.username}
                  </div>
                </div>
              </Popover>
            </div>
          </Header>
          <Layout>
            {this.renderSidebar()}

            <Switch>
              <PrivateRoute exact path={Routes.USER.SETTINGS.ACCOUNT} component={UserAccountSettingsSite} />
              <PrivateRoute exact path={Routes.USER.SETTINGS.ACCESS_TOKENS} component={UserAccessTokensSettingsSite} />
              <PrivateRoute exact path={Routes.DASHBOARD.ROOT} component={() => <Redirect to={Routes.DASHBOARD.PROJECTS} />} />
              <PrivateRoute exact path={Routes.DASHBOARD.PROJECTS} component={ProjectsSite} />
              <PrivateRoute exact path={Routes.DASHBOARD.ACTIVITY} component={ActivitySite} />
              <PrivateRoute path={Routes.DASHBOARD.PROJECT} component={ProjectRouter} />
              <PrivateRoute component={NotFoundSite} />
            </Switch>
          </Layout>
        </Layout>
      </>
    );
  }
}

export { DashboardRouter };
