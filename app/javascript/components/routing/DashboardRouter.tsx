import { DeploymentUnitOutlined, LineChartOutlined, ProjectOutlined } from "@ant-design/icons";
import { Layout } from "antd";
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
import { WhiteButton } from "../ui/WhiteButton";
import { history } from "./history";
import { OrganizationRouter } from "./OrganizationRouter";
import { PrivateRoute } from "./PrivateRoute";
import { ProjectRouter } from "./ProjectRouter";
import { Routes } from "./Routes";

const TranslateButton = styled(WhiteButton)`
    margin-right: 40px;
`;

const MenuList = styled.li`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
`;

const MenuLink = styled<{ active: boolean }>(Link)`
    transition: none;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    background: ${(props) => {
        return props.active ? "rgba(255, 255, 255, 0.25" : undefined;
    }};

    &:hover {
        text-decoration: none;
    }
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
    };

    renderSidebar = (): JSX.Element => {
        return (
            <Switch>
                <PrivateRoute path={Routes.USER.SETTINGS.ROOT} component={UserSettingsSidebar} />
                <PrivateRoute path={Routes.DASHBOARD.PROJECT} component={ProjectSidebar} />
                <PrivateRoute path={Routes.DASHBOARD.ORGANIZATION} component={OrganizationSidebar} />
            </Switch>
        );
    };

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
                            background: "#000",
                            overflow: "hidden"
                        }}
                    >
                        <Link to={Routes.DASHBOARD.ROOT} style={{ textDecoration: "none" }}>
                            <h1
                                style={{
                                    fontSize: 20,
                                    marginBottom: 0,
                                    marginRight: 24,
                                    textDecoration: "none",
                                    fontFamily: "Ubuntu",
                                    color: "#fff"
                                }}
                            >
                                texterify
                            </h1>
                        </Link>
                        <ul
                            className="dashboard-main-menu"
                            style={{
                                overflow: "hidden",
                                marginBottom: 0,
                                marginRight: 24,
                                display: "flex",
                                alignItems: "center",
                                flexGrow: 1
                            }}
                        >
                            <MenuList>
                                <MenuLink
                                    to={Routes.DASHBOARD.PROJECTS}
                                    active={this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS}
                                >
                                    <ProjectOutlined style={{ marginRight: 8 }} /> Projects
                                </MenuLink>
                            </MenuList>
                            <MenuList>
                                <MenuLink
                                    to={Routes.DASHBOARD.ORGANIZATIONS}
                                    active={this.props.history.location.pathname === Routes.DASHBOARD.ORGANIZATIONS}
                                >
                                    <DeploymentUnitOutlined style={{ marginRight: 8 }} /> Organizations
                                </MenuLink>
                            </MenuList>
                            <MenuList>
                                <MenuLink
                                    to={Routes.DASHBOARD.ACTIVITY}
                                    active={this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY}
                                >
                                    <LineChartOutlined style={{ marginRight: 8 }} /> Activity
                                </MenuLink>
                            </MenuList>
                        </ul>
                        {this.props.match.params.projectId && (
                            <TranslateButton
                                type="primary"
                                onClick={() => {
                                    history.push(
                                        Routes.DASHBOARD.PROJECT_EDITOR.replace(
                                            ":projectId",
                                            this.props.match.params.projectId
                                        )
                                    );
                                }}
                            >
                                Translate
                            </TranslateButton>
                        )}
                        <UserProfileHeader />
                    </Layout.Header>
                    <Layout>
                        {this.renderSidebar()}

                        <Switch>
                            <PrivateRoute
                                exact
                                path={Routes.USER.SETTINGS.ACCOUNT}
                                component={UserAccountSettingsSite}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.USER.SETTINGS.ACCESS_TOKENS}
                                component={UserAccessTokensSettingsSite}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.ROOT}
                                component={() => {
                                    return <Redirect to={Routes.DASHBOARD.PROJECTS} />;
                                }}
                            />
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
