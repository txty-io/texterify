import { observer } from "mobx-react";
import * as React from "react";
import { Redirect, RouteComponentProps, Switch } from "react-router-dom";
import { OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { FileImportSite } from "../sites/dashboard/FileImportSite";
import { KeysSite } from "../sites/dashboard/KeysSite";
import { LanguagesSite } from "../sites/dashboard/LanguagesSite";
import { MembersSite } from "../sites/dashboard/MembersSite";
import { ProjectActivitySite } from "../sites/dashboard/ProjectActivitySite";
import { ProjectExportConfigsSite } from "../sites/dashboard/ProjectExportConfigsSite";
import { ProjectExportDownloadSite } from "../sites/dashboard/ProjectExportDownloadSite";
import { ProjectExportHierarchySite } from "../sites/dashboard/ProjectExportHierarchySite";
import { ProjectIntegrationsSite } from "../sites/dashboard/ProjectIntegrationsSite";
import { ProjectIntegrationsWordpressSettingsSite } from "../sites/dashboard/ProjectIntegrationsWordpressSettingsSite";
import { ProjectIntegrationsWordpressSyncSite } from "../sites/dashboard/ProjectIntegrationsWordpressSyncSite";
import { ProjectIssuesActiveSite } from "../sites/dashboard/ProjectIssuesActiveSite";
import { ProjectIssuesIgnoredSite } from "../sites/dashboard/ProjectIssuesIgnoredSite";
import { ProjectMachineTranslationSettingsSite } from "../sites/dashboard/ProjectMachineTranslationSettingsSite";
import { ProjectMachineTranslationSite } from "../sites/dashboard/ProjectMachineTranslationSite";
import { ProjectMachineTranslationUsageSite } from "../sites/dashboard/ProjectMachineTranslationUsageSite";
import { ProjectOTASite } from "../sites/dashboard/ProjectOTASite";
import { ProjectPostProcessingSite } from "../sites/dashboard/ProjectPostProcessingSite";
import { ProjectSettingsAdvancedSite } from "../sites/dashboard/ProjectSettingsAdvancedSite";
import { ProjectSettingsGeneralSite } from "../sites/dashboard/ProjectSettingsGeneralSite";
import { ProjectPlaceholdersSite } from "../sites/dashboard/ProjectPlaceholdersSite";
import { ProjectSite } from "../sites/dashboard/ProjectSite";
import { ProjectValidationsSite } from "../sites/dashboard/ProjectValidationsSite";
import { dashboardStore } from "../stores/DashboardStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { UserDeactivatedProjectModal } from "../ui/UserDeactivatedProjectModal";
import { PrivateRoute } from "./PrivateRoute";
import { Routes } from "./Routes";
import { ProjectForbiddenWordsListsSite } from "../sites/dashboard/ProjectForbiddenWordsListsSite";
import { ProjectTagsSite } from "../sites/dashboard/ProjectTagsSite";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    loading: boolean;
}

@observer
class ProjectRouter extends React.Component<IProps, IState> {
    state: IState = {
        loading: true
    };

    async componentDidMount() {
        const getProjectResponse = await ProjectsAPI.getProject(this.props.match.params.projectId);
        if (getProjectResponse.errors) {
            this.props.history.push(Routes.DASHBOARD.PROJECTS);
        } else {
            dashboardStore.currentProject = getProjectResponse.data;
            dashboardStore.currentProjectIncluded = getProjectResponse.included;
        }
        this.setState({ loading: false });
    }

    componentWillUnmount() {
        dashboardStore.currentProject = null;
        dashboardStore.currentProjectIncluded = null;
    }

    fetchOrganization = async (organizationId: string) => {
        const getOrganizationResponse = await OrganizationsAPI.getOrganization(organizationId);
        if (getOrganizationResponse.errors) {
            this.props.history.push(Routes.DASHBOARD.ORGANIZATIONS);
        } else {
            dashboardStore.currentOrganization = getOrganizationResponse.data;
        }

        this.forceUpdate();
    };

    render() {
        if (this.isInvalidProject() || this.state.loading) {
            return <LoadingOverlay isVisible loadingText="App is loading..." />;
        }

        return (
            <>
                <Switch>
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT} component={ProjectSite} />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE}
                        component={ProjectIssuesActiveSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_ISSUES_IGNORED}
                        component={ProjectIssuesIgnoredSite}
                    />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_KEYS} component={KeysSite} />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_IMPORT}
                        component={() => {
                            return (
                                <Redirect
                                    to={Routes.DASHBOARD.PROJECT_IMPORT_FILE_RESOLVER({
                                        projectId: this.props.match.params.projectId
                                    })}
                                />
                            );
                        }}
                    />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_IMPORT_FILE} component={FileImportSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_EXPORT} component={ProjectExportDownloadSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_MEMBERS} component={MembersSite} />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_SETTINGS}
                        component={() => {
                            return (
                                <Redirect
                                    to={Routes.DASHBOARD.PROJECT_SETTINGS_GENERAL_RESOLVER({
                                        projectId: this.props.match.params.projectId
                                    })}
                                />
                            );
                        }}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_SETTINGS_GENERAL}
                        component={ProjectSettingsGeneralSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_PLACEHOLDERS}
                        component={ProjectPlaceholdersSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_SETTINGS_ADVANCED}
                        component={ProjectSettingsAdvancedSite}
                    />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_LANGUAGES} component={LanguagesSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_ACTIVITY} component={ProjectActivitySite} />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION}
                        component={ProjectMachineTranslationSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_SETTINGS}
                        component={ProjectMachineTranslationSettingsSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_USAGE}
                        component={ProjectMachineTranslationUsageSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_INTEGRATIONS}
                        component={ProjectIntegrationsSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS}
                        component={() => {
                            return (
                                <Redirect
                                    to={Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SYNC_RESOLVER({
                                        projectId: this.props.match.params.projectId
                                    })}
                                />
                            );
                        }}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SYNC}
                        component={ProjectIntegrationsWordpressSyncSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS}
                        component={ProjectIntegrationsWordpressSettingsSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_POST_PROCESSING}
                        component={ProjectPostProcessingSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_VALIDATIONS}
                        component={ProjectValidationsSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_FORBIDDEN_WORDS}
                        component={ProjectForbiddenWordsListsSite}
                    />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_OTA} component={ProjectOTASite} />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS}
                        component={ProjectExportConfigsSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY}
                        component={ProjectExportHierarchySite}
                    />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_TAGS} component={ProjectTagsSite} />
                </Switch>

                {dashboardStore.currentProject?.attributes.current_user_deactivated && <UserDeactivatedProjectModal />}
            </>
        );
    }

    isInvalidProject = () => {
        return !dashboardStore.currentProject || dashboardStore.currentProject.id !== this.props.match.params.projectId;
    };
}

export { ProjectRouter };
