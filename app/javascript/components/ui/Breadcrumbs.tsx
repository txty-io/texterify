import { Breadcrumb } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, Route, RouteComponentProps, withRouter } from "react-router-dom";
import { APIUtils } from "../api/v1/APIUtils";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { OrganizationAvatar } from "./OrganizationAvatar";
import { Styles } from "./Styles";

type IProps = RouteComponentProps<{ projectId?: string; organizationId?: string; }> & {
  breadcrumbName: string;
};
interface IState { }

@observer
class BreadcrumbsUnwrapped extends React.Component<IProps, IState> {
  // tslint:disable-next-line:max-func-body-length
  resolveBreadcrumbs = (): any[] => {
    const breadcrumbs: any = {
      dashboard: {
        root: true,
        name: "Dashboard",
        path: Routes.DASHBOARD.ROOT
      },
      account: {
        root: true,
        name: "Account"
      },
      projects: {
        root: true,
        parent: "dashboard",
        name: "Projects",
        path: Routes.DASHBOARD.PROJECTS
      },
      project: {
        parent: dashboardStore.getProjectOrganization() ? "organization" : "projects",
        name: dashboardStore.currentProject ? dashboardStore.currentProject.attributes.name : "Project",
        path: Routes.DASHBOARD.PROJECT.replace(":projectId", this.props.match.params.projectId)
      },
      organizations: {
        root: true,
        parent: "dashboard",
        name: "Organizations",
        path: Routes.DASHBOARD.ORGANIZATIONS
      },
      organization: {
        parent: "organizations",
        name: (
          <>
            {(dashboardStore.getProjectOrganization() ||
              dashboardStore.getOrganizationId(this.props.match.params.organizationId)) && <OrganizationAvatar
                style={{ height: 16, width: 16, marginRight: 8 }}
                dontRenderIfNoImage
                organization={dashboardStore.getProjectOrganization() ||
                  (dashboardStore.getOrganizationId(this.props.match.params.organizationId) ?
                    { id: dashboardStore.getOrganizationId(this.props.match.params.organizationId) } :
                    undefined
                  )
                }
              />}
            {dashboardStore.getOrganizationName()}
          </>
        ),
        path: Routes.DASHBOARD.ORGANIZATION.replace(
          ":organizationId",
          dashboardStore.getOrganizationId(this.props.match.params.organizationId)
        )
      },
      organizationMembers: {
        parent: "organization",
        name: "Members",
        path: Routes.DASHBOARD.ORGANIZATION_MEMBERS.replace(":organizationId", this.props.match.params.organizationId)
      },
      organizationSettings: {
        parent: "organization",
        name: "Settings",
        path: Routes.DASHBOARD.ORGANIZATION_SETTINGS.replace(":organizationId", this.props.match.params.organizationId)
      },
      languages: {
        parent: "project",
        name: "Languages",
        path: Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", this.props.match.params.projectId)
      },
      keys: {
        parent: "project",
        name: "Keys",
        path: Routes.DASHBOARD.PROJECT_KEYS.replace(":projectId", this.props.match.params.projectId)
      },
      import: {
        parent: "project",
        name: "Import",
        path: Routes.DASHBOARD.PROJECT_IMPORT.replace(":projectId", this.props.match.params.projectId)
      },
      projectMembers: {
        parent: "project",
        name: "Members",
        path: Routes.DASHBOARD.PROJECT_MEMBERS.replace(":projectId", this.props.match.params.projectId)
      },
      projectSettings: {
        parent: "project",
        name: "Settings",
        path: Routes.DASHBOARD.PROJECT_SETTINGS.replace(":projectId", this.props.match.params.projectId)
      },
      projectActivity: {
        parent: "project",
        name: "Activity",
        path: Routes.DASHBOARD.PROJECT_ACTIVITY.replace(":projectId", this.props.match.params.projectId)
      },
      projectExport: {
        parent: "project",
        name: "Export"
      },
      projectExportDownload: {
        parent: "projectExport",
        name: "Download",
        path: Routes.DASHBOARD.PROJECT_EXPORT.replace(":projectId", this.props.match.params.projectId)
      },
      projectExportConfigurations: {
        parent: "projectExport",
        name: "Configurations",
        path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(":projectId", this.props.match.params.projectId)
      },
      projectExportHiearchy: {
        parent: "projectExport",
        name: "Hierarchy",
        path: Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY.replace(":projectId", this.props.match.params.projectId)
      }
    };

    const crumbs: any[] = [];
    let crumb: any = breadcrumbs[this.props.breadcrumbName];
    crumbs.push(crumb);

    while (!crumb.root) {
      crumb = breadcrumbs[crumb.parent];
      crumbs.push(crumb);
    }

    return crumbs.reverse();
  }

  render() {
    const items: JSX.Element[] = [];
    const resolvedBreadcrumbs: any[] = this.resolveBreadcrumbs();

    resolvedBreadcrumbs.map((breadcrumb: any, index: number) => {
      items.push(
        <Breadcrumb.Item key={index}>
          {breadcrumb.path && index !== (resolvedBreadcrumbs.length - 1) ?
            <Link to={breadcrumb.path} style={{ color: Styles.COLOR_PRIMARY, display: "flex", alignItems: "center" }}>
              {breadcrumb.name}
            </Link> :
            breadcrumb.name
          }
        </Breadcrumb.Item>
      );
    });

    return (
      <Breadcrumb style={{ margin: "24px 16px 0", display: "flex", alignItems: "center" }}>
        {items}
      </Breadcrumb>
    );
  }
}

const Breadcrumbs: any = withRouter(BreadcrumbsUnwrapped);
export { Breadcrumbs };
