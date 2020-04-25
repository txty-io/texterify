import { ProjectOutlined, DeploymentUnitOutlined, LineChartOutlined } from "@ant-design/icons";
import { Button, Icon, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, Redirect, RouteComponentProps, Switch } from "react-router-dom";
import styled from "styled-components";
import { ActivitySite } from "../sites/dashboard/ActivitySite";
import { NotFoundSite } from "../sites/dashboard/NotFoundSite";
import { OrganizationSidebar } from "../sites/dashboard/OrganizationSidebar";
import { OrganizationsSite } from "../sites/dashboard/OrganizationsSite";
import { ProjectSidebar } from "../sites/dashboard/ProjectSidebar";
import { ProjectsSite } from "../sites/dashboard/ProjectsSite";
import { UserAccessTokensSettingsSite } from "../sites/dashboard/UserAccessTokensSettingsSite";
import { UserAccountSettingsSite } from "../sites/dashboard/UserAccountSettingsSite";
import { UserSettingsSidebar } from "../sites/dashboard/UserSettingsSidebar";
import { UserProfileHeader } from "../ui/UserProfileHeader";
import { history } from "./history";
import { OrganizationRouter } from "./OrganizationRouter";
import { PrivateRoute } from "./PrivateRoute";
import { ProjectRouter } from "./ProjectRouter";
import { Routes } from "./Routes";

const TranslateButton = styled(Button)`
  margin-right: 40px;
  border: 0;
  background: rgb(66, 75, 109);
  color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    background: rgba(82, 93, 134);
    color: #fff;
  }
`;

const MenuList = styled.li`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: flex;
`;

type IProps = RouteComponentProps<{ projectId?: string }> & {};
interface IState {
  hasSidebar: boolean;
  accountMenuVisible: boolean;
}

@observer
class DashboardRouter extends React.Component<IProps, IState> {
  state: IState = {
    hasSidebar: false,
    accountMenuVisible: false
  };

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

  hasSidebar = (): boolean => {
    return !!document.getElementById("sidebar");
  }

  renderSidebar = (): JSX.Element => {
    return (
      <Switch>
        <PrivateRoute path={Routes.USER.SETTINGS.ROOT} component={UserSettingsSidebar} />
        <PrivateRoute path={Routes.DASHBOARD.PROJECT} component={ProjectSidebar} />
        <PrivateRoute path={Routes.DASHBOARD.ORGANIZATION} component={OrganizationSidebar} />
      </Switch>
    );
  }

  // tslint:disable-next-line:max-func-body-length
  render() {
    return (
      <>
        <Layout>
          <Layout.Header
            style={{
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              color: "#fff",
              zIndex: 10,
              background: "linear-gradient(90deg, #2b3556 0%, #383c54 100%)",
              overflow: "hidden"
            }}
          >
            <Link to={Routes.DASHBOARD.ROOT} style={{ textDecoration: "none" }}>
              <h1 style={{ fontSize: 20, marginBottom: 0, marginRight: 24, textDecoration: "none", fontFamily: "Pacifico", color: "#fff" }}>Texterify</h1>
            </Link>
            <ul
              className="dashboard-main-menu"
              style={{ overflow: "hidden", marginBottom: 0, marginRight: 24, display: "flex", alignItems: "center", flexGrow: 1 }}
            >
              <MenuList>
                <Link
                  to={Routes.DASHBOARD.PROJECTS}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS ? "rgba(255, 255, 255, 0.15" : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS ? "#fff" : "#fff",
                    transition: "none",
                    marginRight: 8,
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  <ProjectOutlined style={{ marginRight: 8 }} /> Projects
                </Link>
              </MenuList>
              <MenuList>
                <Link
                  to={Routes.DASHBOARD.ORGANIZATIONS}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.ORGANIZATIONS ? "rgba(255, 255, 255, 0.15" : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.ORGANIZATIONS ? "#fff" : "#fff",
                    transition: "none",
                    marginRight: 8,
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  <DeploymentUnitOutlined style={{ marginRight: 8 }} /> Organizations
                </Link>
              </MenuList>
              <MenuList>
                <Link
                  to={Routes.DASHBOARD.ACTIVITY}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY ? "rgba(255, 255, 255, 0.15" : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY ? "#fff" : "#fff",
                    transition: "none",
                    textDecoration: "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  <LineChartOutlined style={{ marginRight: 8 }} /> Activity
                </Link>
              </MenuList>
            </ul>
            {this.props.match.params.projectId &&
              <TranslateButton
                type="primary"
                onClick={() => {
                  history.push(Routes.DASHBOARD.PROJECT_EDITOR.replace(":projectId", this.props.match.params.projectId));
                }}
              >
                Translate
              </TranslateButton>
            }
            <UserProfileHeader />
          </Layout.Header>
          <Layout>
            {this.renderSidebar()}

            <Switch>
              <PrivateRoute exact path={Routes.USER.SETTINGS.ACCOUNT} component={UserAccountSettingsSite} />
              <PrivateRoute exact path={Routes.USER.SETTINGS.ACCESS_TOKENS} component={UserAccessTokensSettingsSite} />
              <PrivateRoute exact path={Routes.DASHBOARD.ROOT} component={() => <Redirect to={Routes.DASHBOARD.PROJECTS} />} />
              <PrivateRoute exact path={Routes.DASHBOARD.PROJECTS} component={ProjectsSite} />
              <PrivateRoute exact path={Routes.DASHBOARD.ORGANIZATIONS} component={OrganizationsSite} />
              <PrivateRoute exact path={Routes.DASHBOARD.ACTIVITY} component={ActivitySite} />
              <PrivateRoute path={Routes.DASHBOARD.PROJECT} component={ProjectRouter} />
              <PrivateRoute path={Routes.DASHBOARD.ORGANIZATION} component={OrganizationRouter} />
              <PrivateRoute component={NotFoundSite} />
            </Switch>
          </Layout>
        </Layout>
      </>
    );
  }
}

export { DashboardRouter };
