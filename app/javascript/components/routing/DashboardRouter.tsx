import { DeploymentUnitOutlined, HddOutlined, LineChartOutlined, ProjectOutlined } from "@ant-design/icons";
import * as antd from "antd";
import WhiteLogoWithText from "images/logo_white_text.png";
import { observer } from "mobx-react";
import * as React from "react";
import Hotkeys from "react-hot-keys";
import { Link, Redirect, RouteComponentProps, Switch } from "react-router-dom";
import styled from "styled-components";
import { ICurrentLicenseInformation, LicensesAPI } from "../api/v1/LicensesAPI";
import { UsersAPI } from "../api/v1/UsersAPI";
import { ActivitySite } from "../sites/dashboard/ActivitySite";
import { DashboardNotFoundSite } from "../sites/dashboard/DashboardNotFoundSite";
import { InstanceSidebar } from "../sites/dashboard/InstanceSidebar";
import { OrganizationSidebar } from "../sites/dashboard/OrganizationSidebar";
import { OrganizationsSite } from "../sites/dashboard/OrganizationsSite";
import { ProjectSidebar } from "../sites/dashboard/ProjectSidebar";
import { ProjectsSite } from "../sites/dashboard/ProjectsSite";
import { UserAccessTokensSettingsSite } from "../sites/dashboard/UserAccessTokensSettingsSite";
import { UserAccountSettingsSite } from "../sites/dashboard/UserAccountSettingsSite";
import { UserLicensesSite } from "../sites/dashboard/UserLicensesSite";
import { UserSettingsSidebar } from "../sites/dashboard/UserSettingsSidebar";
import { authStore } from "../stores/AuthStore";
import { ConfirmEmailHint } from "../ui/ConfirmEmailHint";
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { LicenseExpiring } from "../ui/LicenseExpiring";
import { LicenseFreeTrial } from "../ui/LicenseFreeVersion";
import { SearchOverlay } from "../ui/SearchOverlay";
import { UserProfileHeader } from "../ui/UserProfileHeader";
import { Utils } from "../ui/Utils";
import { IS_TEXTERIFY_CLOUD } from "../utilities/Env";
import { InstanceRouter } from "./InstanceRouter";
import { OrganizationRouter } from "./OrganizationRouter";
import { PrivateRoute } from "./PrivateRoute";
import { PrivateRouteTexterifyCloud } from "./PrivateRouteTexterifyCloud";
import { ProjectRouter } from "./ProjectRouter";
import { Routes } from "./Routes";
import { SuperadminRoute } from "./SuperadminRoute";

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

const SearchInputWrapper = styled.div`
    width: auto;
    max-width: 320px;
    margin: 0 auto;
    flex-grow: 1;
    margin-right: 40px;

    input::placeholder {
        color: #bbb !important;
    }
`;

type IProps = RouteComponentProps<{ projectId?: string }>;
interface IState {
    hasSidebar: boolean;
    accountMenuVisible: boolean;
    searchOverlayVisible: boolean;
    currentLicenseInfo: ICurrentLicenseInformation | null;
    currentLicenseInfoLoaded: boolean;
}

@observer
class DashboardRouter extends React.Component<IProps, IState> {
    state: IState = {
        hasSidebar: false,
        accountMenuVisible: false,
        searchOverlayVisible: false,
        currentLicenseInfo: null,
        currentLicenseInfoLoaded: false
    };

    async componentDidMount() {
        this.setState({
            hasSidebar: this.hasSidebar()
        });

        if (!IS_TEXTERIFY_CLOUD) {
            await this.loadCurrentLicense();
        }

        const userInfoResponse = await UsersAPI.getCurrentUserInfo();
        authStore.confirmed = userInfoResponse.confirmed;
    }

    async loadCurrentLicense() {
        try {
            const getCurrentLicenseInfosResponse = await LicensesAPI.getCurrentLicenseInfo();
            this.setState({
                currentLicenseInfo: getCurrentLicenseInfosResponse,
                currentLicenseInfoLoaded: true
            });
        } catch (e) {
            console.error(e);
        }
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
                <PrivateRoute path={Routes.DASHBOARD.INSTANCE.ROOT} component={InstanceSidebar} />
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
                {!IS_TEXTERIFY_CLOUD && this.state.currentLicenseInfoLoaded && (
                    <>
                        <LicenseFreeTrial
                            hasLicense={this.state.currentLicenseInfo.has_license}
                            expiresAt={this.state.currentLicenseInfo.expires_at}
                        />
                        <LicenseExpiring expiresAt={this.state.currentLicenseInfo.expires_at} />
                    </>
                )}
                {authStore.confirmed === false && <ConfirmEmailHint />}
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
                        <Link to={Routes.DASHBOARD.ROOT}>
                            <img src={WhiteLogoWithText} style={{ maxHeight: 32, marginRight: 24 }} />
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
                                                ? "var(--primary-light-color)"
                                                : undefined,
                                        color:
                                            this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS
                                                ? "var(--blue-color)"
                                                : undefined
                                    }}
                                    data-id="main-menu-projects"
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
                                                ? "var(--primary-light-color)"
                                                : undefined,
                                        color:
                                            this.props.history.location.pathname === Routes.DASHBOARD.ORGANIZATIONS
                                                ? "var(--blue-color)"
                                                : undefined
                                    }}
                                    data-id="main-menu-organizations"
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
                                                ? "var(--primary-light-color)"
                                                : undefined,
                                        color:
                                            this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY
                                                ? "var(--blue-color)"
                                                : undefined
                                    }}
                                    data-id="main-menu-activity"
                                >
                                    <LineChartOutlined style={{ marginRight: 8 }} /> Activity
                                </MenuLink>
                            </MenuList>
                        </ul>

                        <SearchInputWrapper>
                            <antd.Input
                                placeholder={`Search projects        ${Utils.getCommandKeyDependingOnPlatform()} + ⇧ + P`}
                                onClick={(e) => {
                                    e.preventDefault();

                                    this.setState({
                                        searchOverlayVisible: true
                                    });
                                }}
                                value=""
                                style={{ borderTop: 0, borderRight: 0, borderLeft: 0, boxShadow: "none" }}
                            />
                        </SearchInputWrapper>

                        {authStore.currentUser?.is_superadmin && (
                            <ul
                                className="dashboard-main-menu"
                                style={{
                                    overflow: "hidden",
                                    marginBottom: 0,
                                    marginLeft: 0,
                                    marginRight: 24,
                                    display: "flex",
                                    alignItems: "center"
                                }}
                            >
                                <MenuList>
                                    <MenuLink
                                        to={Routes.DASHBOARD.INSTANCE.ROOT}
                                        style={{
                                            background: this.props.history.location.pathname.startsWith(
                                                Routes.DASHBOARD.INSTANCE.ROOT
                                            )
                                                ? "var(--primary-light-color)"
                                                : undefined,
                                            color: this.props.history.location.pathname.startsWith(
                                                Routes.DASHBOARD.INSTANCE.ROOT
                                            )
                                                ? "var(--blue-color)"
                                                : undefined
                                        }}
                                        data-id="main-menu-instance-settings"
                                    >
                                        <HddOutlined style={{ marginRight: 8 }} />
                                        Admin
                                    </MenuLink>
                                </MenuList>
                            </ul>
                        )}

                        {/* <MessageOutlined style={{ marginRight: 40 }} /> */}

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
                            <PrivateRouteTexterifyCloud
                                exact
                                path={Routes.USER.SETTINGS.LICENSES}
                                component={UserLicensesSite}
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
                            <SuperadminRoute path={Routes.DASHBOARD.INSTANCE.ROOT} component={InstanceRouter} />
                            <PrivateRoute component={DashboardNotFoundSite} />
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
