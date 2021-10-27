import { DeploymentUnitOutlined, HddOutlined, LineChartOutlined, ProjectOutlined } from "@ant-design/icons";
import * as antd from "antd";
import WhiteLogoWithText from "images/logo_white_text.svg";
import { observer } from "mobx-react";
import * as React from "react";
import Hotkeys from "react-hot-keys";
import { Link, Redirect, RouteComponentProps, Switch } from "react-router-dom";
import styled from "styled-components";
import { ICurrentLicenseInformation, LicensesAPI } from "../api/v1/LicensesAPI";
import { ICustomSubscription } from "../api/v1/OrganizationsAPI";
import { UsersAPI } from "../api/v1/UsersAPI";
import { AboutSite } from "../sites/dashboard/AboutSite";
import { ActivitySite } from "../sites/dashboard/ActivitySite";
import { DashboardNotFoundSite } from "../sites/dashboard/DashboardNotFoundSite";
import { InstanceSidebar } from "../sites/dashboard/InstanceSidebar";
import { OrganizationSidebar } from "../sites/dashboard/OrganizationSidebar";
import { OrganizationsSite } from "../sites/dashboard/OrganizationsSite";
import { ProjectSidebar } from "../sites/dashboard/ProjectSidebar";
import { ProjectsSite } from "../sites/dashboard/ProjectsSite";
import { SetupSite, STEPS } from "../sites/dashboard/SetupSite";
import { UserAccessTokensSettingsSite } from "../sites/dashboard/UserAccessTokensSettingsSite";
import { UserAccountSettingsSite } from "../sites/dashboard/UserAccountSettingsSite";
import { UserLicensesSite } from "../sites/dashboard/UserLicensesSite";
import { UserSettingsSidebar } from "../sites/dashboard/UserSettingsSidebar";
import { authStore } from "../stores/AuthStore";
import { ConfirmEmailHint } from "../ui/ConfirmEmailHint";
import { DarkModeToggle } from "../ui/DarkModeToggle";
import { getKeystrokePreview } from "../ui/KeystrokePreview";
import { LicenseExpiring } from "../ui/LicenseExpiring";
import { LicenseFreeTrial } from "../ui/LicenseFreeVersion";
import { SearchOverlay } from "../ui/SearchOverlay";
import { UserProfileHeader } from "../ui/UserProfileHeader";
import { IS_TEXTERIFY_CLOUD } from "../utilities/Env";
import { InstanceRouter } from "./InstanceRouter";
import { OrganizationRouter } from "./OrganizationRouter";
import { PrivateRoute } from "./PrivateRoute";
import { PrivateRouteTexterifyCloud } from "./PrivateRouteTexterifyCloud";
import { ProjectRouter } from "./ProjectRouter";
import { Routes } from "./Routes";
import { SuperadminRoute } from "./SuperadminRoute";

export const MenuList = styled.li`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
`;

interface IMenuLinkWrapperProps {
    isActive: boolean;
}

export const MenuLinkWrapper = styled.div<IMenuLinkWrapperProps>`
    transition: none;
    margin-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 4px;

    background: ${(props: IMenuLinkWrapperProps) => {
        return props.isActive ? "var(--header-menu-item-active-background)" : "none";
    }};

    &:hover {
        text-decoration: none;
    }

    a {
        text-decoration: none;
        padding: 8px 20px;
        display: inline-block;

        color: ${(props: IMenuLinkWrapperProps) => {
            return props.isActive ? "#fff" : "#ffffffbf";
        }};

        &:hover {
            color: #fff;
        }
    }
`;

const SearchInputWrapper = styled.div`
    width: auto;
    max-width: 320px;
    margin: 0 auto;
    flex-grow: 1;
    margin-right: 40px;

    input::placeholder {
        color: #999 !important;
    }

    &:hover {
        input::placeholder {
            color: #ccc !important;
        }
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
        authStore.version = userInfoResponse.version;
        authStore.redeemableCustomSubscriptions = userInfoResponse.redeemable_custom_subscriptions
            ? userInfoResponse.redeemable_custom_subscriptions.data
            : [];
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
                            <img src={WhiteLogoWithText} style={{ maxHeight: 28, marginRight: 24 }} />
                        </Link>
                        <ul
                            className="dashboard-main-menu"
                            style={{
                                overflow: "hidden",
                                marginBottom: 0,
                                marginRight: 24,
                                display: "flex",
                                alignItems: "center",
                                marginLeft: 50
                            }}
                        >
                            <MenuList>
                                <MenuLinkWrapper
                                    isActive={this.props.history.location.pathname === Routes.DASHBOARD.PROJECTS}
                                    data-id="main-menu-projects"
                                >
                                    <Link to={Routes.DASHBOARD.PROJECTS}>
                                        <ProjectOutlined style={{ marginRight: 8 }} /> Projects
                                    </Link>
                                </MenuLinkWrapper>
                            </MenuList>
                            <MenuList>
                                <MenuLinkWrapper
                                    isActive={this.props.history.location.pathname === Routes.DASHBOARD.ORGANIZATIONS}
                                    data-id="main-menu-organizations"
                                >
                                    <Link to={Routes.DASHBOARD.ORGANIZATIONS}>
                                        <DeploymentUnitOutlined style={{ marginRight: 8 }} /> Organizations
                                    </Link>
                                </MenuLinkWrapper>
                            </MenuList>
                            <MenuList>
                                <MenuLinkWrapper
                                    isActive={this.props.history.location.pathname === Routes.DASHBOARD.ACTIVITY}
                                    data-id="main-menu-activity"
                                >
                                    <Link to={Routes.DASHBOARD.ACTIVITY}>
                                        <LineChartOutlined style={{ marginRight: 8 }} /> Activity
                                    </Link>
                                </MenuLinkWrapper>
                            </MenuList>
                        </ul>

                        <SearchInputWrapper>
                            <antd.Input
                                placeholder={`Search projects        ${getKeystrokePreview(["ctrl", "shift", "p"])}`}
                                onClick={(e) => {
                                    e.preventDefault();

                                    this.setState({
                                        searchOverlayVisible: true
                                    });
                                }}
                                value=""
                                style={{ border: 0, boxShadow: "none", color: "transparent" }}
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
                                    <MenuLinkWrapper
                                        isActive={this.props.history.location.pathname.startsWith(
                                            Routes.DASHBOARD.INSTANCE.ROOT
                                        )}
                                        data-id="main-menu-instance-settings"
                                    >
                                        <Link to={Routes.DASHBOARD.INSTANCE.ROOT}>
                                            <HddOutlined style={{ marginRight: 8 }} />
                                            Admin
                                        </Link>
                                    </MenuLinkWrapper>
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
                                path={Routes.DASHBOARD.SETUP}
                                component={() => {
                                    return <Redirect to={Routes.DASHBOARD.SETUP_ORGANIZATION_NEW} />;
                                }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_ORGANIZATION_NEW}
                                component={SetupSite}
                                componentParams={{ step: STEPS.ORGANIZATION }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_ORGANIZATION}
                                component={SetupSite}
                                componentParams={{ step: STEPS.ORGANIZATION }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_PLAN}
                                component={SetupSite}
                                componentParams={{ step: STEPS.PLAN }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_PROJECT_NEW}
                                component={SetupSite}
                                componentParams={{ step: STEPS.PROJECT }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_PROJECT}
                                component={SetupSite}
                                componentParams={{ step: STEPS.PROJECT }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES}
                                component={SetupSite}
                                componentParams={{ step: STEPS.LANGUAGES }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_PROJECT_IMPORT}
                                component={SetupSite}
                                componentParams={{ step: STEPS.IMPORT }}
                            />
                            <PrivateRoute
                                exact
                                path={Routes.DASHBOARD.SETUP_PROJECT_SUCCESS}
                                component={SetupSite}
                                componentParams={{ step: STEPS.SUCCESS }}
                            />
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
                            <PrivateRoute exact path={Routes.USER.SETTINGS.ABOUT} component={AboutSite} />
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
