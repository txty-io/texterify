import { Breadcrumb } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, Route, RouteComponentProps, withRouter } from "react-router-dom";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { Styles } from "./Styles";

type IProps = RouteComponentProps<{ projectId: string }> & {
  breadcrumbName: string;
};
interface IState { }

@observer
class BreadcrumbsUnwrapped extends React.Component<IProps, IState> {
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
        root: true, // TODO: Remove if a dashboard is available.
        parent: "dashboard",
        name: "Projects",
        path: Routes.DASHBOARD.PROJECTS
      },
      project: {
        parent: "projects",
        name: dashboardStore.currentProject ? dashboardStore.currentProject.attributes.name : "Project",
        path: Routes.DASHBOARD.PROJECT.replace(":projectId", this.props.match.params.projectId)
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
      export: {
        parent: "project",
        name: "Export",
        path: Routes.DASHBOARD.PROJECT_IMPORT.replace(":projectId", this.props.match.params.projectId)
      },
      members: {
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

  render(): JSX.Element {
    const items: JSX.Element[] = [];
    const resolvedBreadcrumbs: any[] = this.resolveBreadcrumbs();

    resolvedBreadcrumbs.map((breadcrumb: any, index: number) => {
      items.push(
        <Breadcrumb.Item key={index}>
          {breadcrumb.path && index !== (resolvedBreadcrumbs.length - 1) ?
            <Link to={breadcrumb.path} style={{ color: Styles.COLOR_PRIMARY }}>{breadcrumb.name}</Link> :
            breadcrumb.name
          }
        </Breadcrumb.Item>
      );
    });

    return (
      <Breadcrumb style={{ margin: "24px 16px 0" }}>
        {items}
      </Breadcrumb>
    );
  }
}

const Breadcrumbs: any = withRouter(BreadcrumbsUnwrapped);
export { Breadcrumbs };
