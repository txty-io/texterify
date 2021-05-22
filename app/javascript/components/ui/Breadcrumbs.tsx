import { DeploymentUnitOutlined, ProjectOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { OrganizationAvatar } from "./OrganizationAvatar";

type IProps = RouteComponentProps<{ projectId?: string; organizationId?: string }> & {
    breadcrumbName: string;
};

@observer
class BreadcrumbsUnwrapped extends React.Component<IProps> {
    resolveBreadcrumbs = () => {
        const breadcrumbs = {
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
                name: (
                    <>
                        <ProjectOutlined style={{ marginRight: 8 }} />
                        Projects
                    </>
                ),
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
                name: (
                    <>
                        <DeploymentUnitOutlined style={{ marginRight: 8 }} /> Organizations
                    </>
                ),
                path: Routes.DASHBOARD.ORGANIZATIONS
            },
            organization: {
                parent: "organizations",
                name: (
                    <>
                        {(dashboardStore.getProjectOrganization() ||
                            dashboardStore.getOrganizationId(this.props.match.params.organizationId)) && (
                            <OrganizationAvatar
                                style={{ height: 16, width: 16, marginRight: 8 }}
                                dontRenderIfNoImage
                                organization={
                                    dashboardStore.getProjectOrganization() ||
                                    (dashboardStore.getOrganizationId(this.props.match.params.organizationId)
                                        ? {
                                              id: dashboardStore.getOrganizationId(
                                                  this.props.match.params.organizationId
                                              )
                                          }
                                        : undefined)
                                }
                            />
                        )}
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
                path: Routes.DASHBOARD.ORGANIZATION_MEMBERS.replace(
                    ":organizationId",
                    this.props.match.params.organizationId
                )
            },
            organizationSettings: {
                parent: "organization",
                name: "Settings",
                path: Routes.DASHBOARD.ORGANIZATION_SETTINGS.replace(
                    ":organizationId",
                    this.props.match.params.organizationId
                )
            },
            organizationSubscription: {
                parent: "organization",
                name: "Subscription",
                path: Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION.replace(
                    ":organizationId",
                    this.props.match.params.organizationId
                )
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
            projectMachineTranslation: {
                parent: "project",
                name: "Machine Translation",
                path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION.replace(
                    ":projectId",
                    this.props.match.params.projectId
                )
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
            projectValidations: {
                parent: "project",
                name: "Validations",
                path: Routes.DASHBOARD.PROJECT_VALIDATIONS.replace(":projectId", this.props.match.params.projectId)
            },
            projectOTA: {
                parent: "project",
                name: "Over the Air Translations",
                path: Routes.DASHBOARD.PROJECT_OTA.replace(":projectId", this.props.match.params.projectId)
            },
            projectIntegrations: {
                parent: "project",
                name: "Integrations",
                path: Routes.DASHBOARD.PROJECT_INTEGRATIONS.replace(":projectId", this.props.match.params.projectId)
            },
            projectPostProcessing: {
                parent: "project",
                name: "Post Processing",
                path: Routes.DASHBOARD.PROJECT_POST_PROCESSING.replace(":projectId", this.props.match.params.projectId)
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
                path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                    ":projectId",
                    this.props.match.params.projectId
                )
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
    };

    render() {
        const items: JSX.Element[] = [];
        const resolvedBreadcrumbs: any[] = this.resolveBreadcrumbs();

        resolvedBreadcrumbs.map((breadcrumb: any, index: number) => {
            items.push(
                <Breadcrumb.Item key={index}>
                    {breadcrumb.path && index !== resolvedBreadcrumbs.length - 1 ? (
                        <Link to={breadcrumb.path} style={{ display: "flex", alignItems: "center" }}>
                            {breadcrumb.name}
                        </Link>
                    ) : (
                        breadcrumb.name
                    )}
                </Breadcrumb.Item>
            );
        });

        return (
            <Breadcrumb style={{ margin: "32px 16px 0", display: "flex", alignItems: "center", flexShrink: 0 }}>
                {items}
            </Breadcrumb>
        );
    }
}

const Breadcrumbs: any = withRouter(BreadcrumbsUnwrapped);
export { Breadcrumbs };
