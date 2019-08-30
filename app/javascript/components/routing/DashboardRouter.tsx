import { Button, Icon, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, Redirect, RouteComponentProps, Switch } from "react-router-dom";
import styled from "styled-components";
import { ActivitySite } from "../sites/dashboard/ActivitySite";
import { NotFoundSite } from "../sites/dashboard/NotFoundSite";
import { ProjectSidebar } from "../sites/dashboard/ProjectSidebar";
import { ProjectsSite } from "../sites/dashboard/ProjectsSite";
import { UserAccessTokensSettingsSite } from "../sites/dashboard/UserAccessTokensSettingsSite";
import { UserAccountSettingsSite } from "../sites/dashboard/UserAccountSettingsSite";
import { UserSettingsSidebar } from "../sites/dashboard/UserSettingsSidebar";
import { UserProfileHeader } from "../ui/UserProfileHeader";
import { history } from "./history";
import { PrivateRoute } from "./PrivateRoute";
import { ProjectRouter } from "./ProjectRouter";
import { Routes } from "./Routes";

const TranslateButton = styled(Button)`
  margin-right: 40px;
  border: 1px solid rgba(255, 255, 255, 0.95);
  background: transparent;
  color: rgba(255, 255, 255, 0.95);

  &:hover {
    border-color: #fff;
    color: #fff;
  }
`;

type IProps = RouteComponentProps<{ projectId?: string }> & {};
interface IState {
  hasSidebar: boolean;
  accountMenuVisible: boolean;
}

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
          <Layout.Header
            style={{ padding: "0 24px", display: "flex", alignItems: "center", color: "#fff", zIndex: 10, background: "linear-gradient(90deg, #2b3556 0%, #383c54 100%)" }}
          >
            <Link to={Routes.DASHBOARD.ROOT} style={{ textDecoration: "none" }}>
              <h1 style={{ fontSize: 20, marginBottom: 0, marginRight: 24, textDecoration: "none", fontFamily: "Pacifico", color: "#fff" }}>Texterify</h1>
            </Link>
            <ul className="dashboard-main-menu" style={{ marginBottom: 0, marginRight: 24, display: "flex", alignItems: "center", flexGrow: 1 }}>
              <li>
                {/* <Link
                  to={Routes.DASHBOARD.ROOT}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.ROOT ? "rgba(255, 255, 255, 0.15" : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.ROOT ? "#fff" : "#fff",
                    transition: "none",
                    marginRight: 8,
                    textDecoration: "none"
                  }}
                >
                  <Icon type="appstore" style={{ marginRight: 8 }} /> Dashboard
                </Link> */}
                <Link
                  to={Routes.DASHBOARD.PROJECTS}
                  style={{
                    background: this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS ? "rgba(255, 255, 255, 0.15" : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS ? "#fff" : "#fff",
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
                    background: this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY ? "rgba(255, 255, 255, 0.15" : undefined,
                    color: this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY ? "#fff" : "#fff",
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
                    background: this.props.history.location.pathname === Routes.OTHER.TOOLS ? "rgba(255, 255, 255, 0.15" : undefined,
                    color: this.props.history.location.pathname === Routes.OTHER.TOOLS ? "#fff" : "#fff",
                    transition: "none",
                    marginRight: 8,
                    textDecoration: "none"
                  }}
                >
                  Tools & Integrations
                </Link>
              </li> */}
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
