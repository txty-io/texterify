import { DeploymentUnitOutlined, LineChartOutlined, MessageOutlined, ProjectOutlined } from "@ant-design/icons";
import * as antd from "antd";
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
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { SearchOverlay } from "../ui/SearchOverlay";
import { UserProfileHeader } from "../ui/UserProfileHeader";
import { history } from "./history";
import { OrganizationRouter } from "./OrganizationRouter";
import { PrivateRoute } from "./PrivateRoute";
import { ProjectRouter } from "./ProjectRouter";
import { Routes } from "./Routes";
import Hotkeys from "react-hot-keys";

const TranslateButton = styled(antd.Button)`
    margin-right: 40px;
    color: #fff;
    background-color: #177ddc;
    border-color: #177ddc;

    &:hover {
        background-color: #095cb5;
        border-color: #095cb5;
    }
`;

const MenuList = styled.li`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
`;

const MenuLink = styled(Link)`
    transition: none;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        text-decoration: none;
    }
`;

type IProps = RouteComponentProps<{ projectId?: string }>;
interface IState {
    hasSidebar: boolean;
    accountMenuVisible: boolean;
    searchOverlayVisible: boolean;
}

@observer
class DashboardRouter extends React.Component<IProps, IState> {
    state: IState = {
        hasSidebar: false,
        accountMenuVisible: false,
        searchOverlayVisible: false
    };

    componentDidMount() {
        this.setState({
            hasSidebar: this.hasSidebar()
        });
    }

    componentDidUpdate() {
        if (this.state.hasSidebar !== this.hasSidebar()) {
            this.setState({
                hasSidebar: this.hasSidebar()
            });
        }
    }

    hasSidebar = () => {
        return !!document.getElementById("sidebar");
    };

    renderSidebar = () => {
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
                <Hotkeys
                    keyName="command+shift+p,ctrl+shift+p"
                    onKeyDown={() => {
                        this.setState({ searchOverlayVisible: !this.state.searchOverlayVisible });
                    }}
                    filter={() => {
                        return true;
                    }}
                    allowRepeat
                />
                <antd.Layout>
                    <antd.Layout.Header
                        style={{
                            padding: "0 24px",
                            display: "flex",
                            alignItems: "center",
                            color: "#fff",
                            zIndex: 10,
                            overflow: "hidden"
                        }}
                        // Apply the dark-theme class because the
                        // main menu bar is always in dark mode.
                        className="dark-theme"
                    >
                        <Link to={Routes.DASHBOARD.ROOT} style={{ textDecoration: "none" }}>
                            <h1
                                style={{
                                    fontSize: 18,
                                    marginBottom: 0,
                                    marginRight: 24,
                                    textDecoration: "none",
                                    fontFamily: "Ubuntu",
                                    color: "#fff",
                                    whiteSpace: "nowrap"
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
                                alignItems: "center"
                            }}
                        >
                            <MenuList>
                                <MenuLink
                                    to={Routes.DASHBOARD.PROJECTS}
                                    style={{
                                        background:
                                            this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS
                                                ? "#303030"
                                                : undefined
                                    }}
                                >
                                    <ProjectOutlined style={{ marginRight: 8 }} /> Projects
                                </MenuLink>
                            </MenuList>
                            <MenuList>
                                <MenuLink
                                    to={Routes.DASHBOARD.ORGANIZATIONS}
                                    style={{
                                        background:
                                            this.props.history.location.pathname === Routes.DASHBOARD.ORGANIZATIONS
                                                ? "#303030"
                                                : undefined
                                    }}
                                >
                                    <DeploymentUnitOutlined style={{ marginRight: 8 }} /> Organizations
                                </MenuLink>
                            </MenuList>
                            <MenuList>
                                <MenuLink
                                    to={Routes.DASHBOARD.ACTIVITY}
                                    style={{
                                        background:
                                            this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY
                                                ? "#303030"
                                                : undefined
                                    }}
                                >
                                    <LineChartOutlined style={{ marginRight: 8 }} /> Activity
                                </MenuLink>
                            </MenuList>
                        </ul>

                        <antd.Input
                            style={{ width: "auto", maxWidth: 320, margin: "0 auto", flexGrow: 1, marginRight: 40 }}
                            placeholder="Search projects        ⌘ + ⇧ + P"
                            onClick={(e) => {
                                e.preventDefault();

                                this.setState({
                                    searchOverlayVisible: true
                                });
                            }}
                            value=""
                        />

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
                                style={{ marginRight: 40 }}
                            >
                                Open editor
                            </TranslateButton>
                        )}

                        <MessageOutlined style={{ marginRight: 40 }} />

                        <DarkModeToggle style={{ marginRight: 40 }} />

                        <UserProfileHeader />
                    </antd.Layout.Header>
                    <antd.Layout>
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
                            <PrivateRoute
                                path={Routes.DASHBOARD.PROJECT}
                                component={ProjectRouter}
                                key={this.props.match.params.projectId}
                            />
                            <PrivateRoute path={Routes.DASHBOARD.ORGANIZATION} component={OrganizationRouter} />
                            <PrivateRoute component={NotFoundSite} />
                        </Switch>
                    </antd.Layout>
                </antd.Layout>

                {this.state.searchOverlayVisible && (
                    <SearchOverlay
                        onClose={() => {
                            this.setState({ searchOverlayVisible: false });
                        }}
                    />
                )}
            </>
        );
    }
}

export { DashboardRouter };
