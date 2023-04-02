import { BuildingStorefrontIcon, ChevronRightIcon, FolderIcon } from "@heroicons/react/24/solid";
import { Breadcrumb } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { OrganizationAvatar } from "./OrganizationAvatar";

type IProps = RouteComponentProps<{ projectId?: string; organizationId?: string; importId?: string }> & {
    breadcrumbName: string;
    currentCrumbDescription?: string;
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
                        <FolderIcon style={{ marginRight: 8 }} />
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
                        <BuildingStorefrontIcon width={12} style={{ marginRight: 8 }} /> Organizations
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
            organizationMachineTranslation: {
                parent: "organization",
                name: "Machine translation",
                path: Routes.DASHBOARD.ORGANIZATION_MACHINE_TRANSLATION.replace(
                    ":organizationId",
                    this.props.match.params.organizationId
                )
            },
            organizationValidations: {
                parent: "organization",
                name: "Validations",
                path: Routes.DASHBOARD.ORGANIZATION_VALIDATIONS_RESOLVER({
                    organizationId: this.props.match.params.organizationId
                })
            },
            organizationForbiddenWords: {
                parent: "organization",
                name: "Forbidden words",
                path: Routes.DASHBOARD.ORGANIZATION_FORBIDDEN_WORDS_RESOLVER({
                    organizationId: this.props.match.params.organizationId
                })
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
            imports: {
                parent: "project",
                name: "Imports",
                path: Routes.DASHBOARD.PROJECT_IMPORTS.replace(":projectId", this.props.match.params.projectId)
            },
            importsDetails: {
                parent: "imports",
                name: this.props.currentCrumbDescription,
                path: Routes.DASHBOARD.PROJECT_IMPORTS_DETAILS_RESOLVER({
                    projectId: this.props.match.params.projectId,
                    importId: this.props.match.params.importId
                })
            },
            projectMembers: {
                parent: "project",
                name: "Members",
                path: Routes.DASHBOARD.PROJECT_MEMBERS.replace(":projectId", this.props.match.params.projectId)
            },
            projectMachineTranslation: {
                parent: "project",
                name: "Machine translation",
                path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION.replace(
                    ":projectId",
                    this.props.match.params.projectId
                )
            },
            projectMachineTranslationSettings: {
                parent: "projectMachineTranslation",
                name: "Settings",
                path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_SETTINGS.replace(
                    ":projectId",
                    this.props.match.params.projectId
                )
            },
            projectMachineTranslationUsage: {
                parent: "projectMachineTranslation",
                name: "Usage",
                path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_USAGE.replace(
                    ":projectId",
                    this.props.match.params.projectId
                )
            },
            projectSettings: {
                parent: "project",
                name: "Settings"
            },
            projectSettingsGeneral: {
                parent: "projectSettings",
                name: "General",
                path: Routes.DASHBOARD.PROJECT_SETTINGS_GENERAL_RESOLVER({
                    projectId: this.props.match.params.projectId
                })
            },
            projectSettingsAdvanced: {
                parent: "projectSettings",
                name: "Advanced",
                path: Routes.DASHBOARD.PROJECT_SETTINGS_ADVANCED_RESOLVER({
                    projectId: this.props.match.params.projectId
                })
            },
            projectPlaceholders: {
                parent: "projectValidations",
                name: "Placeholders",
                path: Routes.DASHBOARD.PROJECT_PLACEHOLDERS_RESOLVER({
                    projectId: this.props.match.params.projectId
                })
            },
            projectForbiddenWords: {
                parent: "projectValidations",
                name: "Forbidden words",
                path: Routes.DASHBOARD.PROJECT_FORBIDDEN_WORDS_RESOLVER({
                    projectId: this.props.match.params.projectId
                })
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
            projectTags: {
                parent: "project",
                name: "Tags",
                path: Routes.DASHBOARD.PROJECT_TAGS.replace(":projectId", this.props.match.params.projectId)
            },
            projectOTA: {
                parent: "project",
                name: "Over the Air",
                path: Routes.DASHBOARD.PROJECT_OTA.replace(":projectId", this.props.match.params.projectId)
            },
            projectIntegrations: {
                parent: "project",
                name: "Integrations",
                path: Routes.DASHBOARD.PROJECT_INTEGRATIONS.replace(":projectId", this.props.match.params.projectId)
            },
            projectIntegrationsWordpress: {
                parent: "project",
                name: "WordPress"
            },
            projectIntegrationsWordpressSettings: {
                parent: "projectIntegrationsWordpress",
                name: "Settings",
                path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS_RESOLVER({
                    projectId: this.props.match.params.projectId
                })
            },
            projectIntegrationsWordpressSync: {
                parent: "projectIntegrationsWordpress",
                name: "Synchronize",
                path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SYNC_RESOLVER({
                    projectId: this.props.match.params.projectId
                })
            },
            projectPostProcessing: {
                parent: "project",
                name: "Post processing",
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
                name: "Export configs",
                path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                    ":projectId",
                    this.props.match.params.projectId
                )
            },
            projectExportFlavors: {
                parent: "projectExport",
                name: "Flavors",
                path: Routes.DASHBOARD.PROJECT_EXPORT_FLAVORS.replace(":projectId", this.props.match.params.projectId)
            },
            projectExportHiearchy: {
                parent: "projectExport",
                name: "Hierarchy",
                path: Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY.replace(":projectId", this.props.match.params.projectId)
            },
            projectActiveIssues: {
                parent: "project",
                name: "Issues",
                path: Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE.replace(":projectId", this.props.match.params.projectId)
            },
            projectIssuesIgnored: {
                parent: "project",
                name: "Ignored issues",
                path: Routes.DASHBOARD.PROJECT_ISSUES_IGNORED.replace(":projectId", this.props.match.params.projectId)
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
                        <Link to={breadcrumb.path}>{breadcrumb.name}</Link>
                    ) : (
                        breadcrumb.name
                    )}
                </Breadcrumb.Item>
            );
        });

        return (
            <Breadcrumb
                style={{ margin: "32px 16px 0", display: "flex", alignItems: "center", flexShrink: 0 }}
                separator={<ChevronRightIcon width={12} />}
            >
                {items}
            </Breadcrumb>
        );
    }
}

const Breadcrumbs = withRouter(BreadcrumbsUnwrapped);
export { Breadcrumbs };
