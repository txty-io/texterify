import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { ImportSite } from "../sites/dashboard/ImportSite";
import { KeysSite } from "../sites/dashboard/KeysSite";
import { LanguagesSite } from "../sites/dashboard/LanguagesSite";
import { MembersSite } from "../sites/dashboard/MembersSite";
import { ProjectActivitySite } from "../sites/dashboard/ProjectActivitySite";
import { ProjectExportConfigsSite } from "../sites/dashboard/ProjectExportConfigsSite";
import { ProjectExportDownloadSite } from "../sites/dashboard/ProjectExportDownloadSite";
import { ProjectExportHierarchySite } from "../sites/dashboard/ProjectExportHierarchySite";
import { ProjectSettingsSite } from "../sites/dashboard/ProjectSettingsSite";
import { ProjectSite } from "../sites/dashboard/ProjectSite";
import { dashboardStore } from "../stores/DashboardStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { PrivateRoute } from "./PrivateRoute";
import { Routes } from "./Routes";
import { ProjectPostProcessingSite } from "../sites/dashboard/ProjectPostProcessingSite";
import { ProjectValidationsSite } from "../sites/dashboard/ProjectValidationsSite";
import { ProjectOTASite } from "../sites/dashboard/ProjectOTASite";
import { ProjectIntegrationsSite } from "../sites/dashboard/ProjectIntegrationsSite";
import { OrganizationsAPI } from "../api/v1/OrganizationsAPI";

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
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_KEYS} component={KeysSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_IMPORT} component={ImportSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_EXPORT} component={ProjectExportDownloadSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_MEMBERS} component={MembersSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_SETTINGS} component={ProjectSettingsSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_LANGUAGES} component={LanguagesSite} />
                    <PrivateRoute exact path={Routes.DASHBOARD.PROJECT_ACTIVITY} component={ProjectActivitySite} />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.PROJECT_INTEGRATIONS}
                        component={ProjectIntegrationsSite}
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
                </Switch>
            </>
        );
    }

    isInvalidProject = () => {
        return !dashboardStore.currentProject || dashboardStore.currentProject.id !== this.props.match.params.projectId;
    };
}

export { ProjectRouter };
