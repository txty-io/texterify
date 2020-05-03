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

type IProps = RouteComponentProps<{ projectId: string }>;

@observer
class ProjectRouter extends React.Component<IProps> {
    async componentDidMount() {
        const getProjectResponse = await ProjectsAPI.getProject(this.props.match.params.projectId);
        if (getProjectResponse.errors) {
            this.props.history.push(Routes.DASHBOARD.PROJECTS);
        } else {
            dashboardStore.currentProject = getProjectResponse.data;
            dashboardStore.currentProjectIncluded = getProjectResponse.included;
        }
    }

    componentWillUnmount() {
        dashboardStore.currentProject = null;
        dashboardStore.currentProjectIncluded = null;
    }

    render() {
        if (this.isInvalidProject()) {
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
