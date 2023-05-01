import { Layout, Statistic, Tooltip } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { IProject } from "../../api/v1/ProjectsAPI";
import { NewProjectFormModal } from "../../forms/NewProjectFormModal";
import { useOrganization } from "../../network/useOrganization";
import { Routes } from "../../routing/Routes";
import { history } from "../../routing/history";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { OrganizationAvatar } from "../../ui/OrganizationAvatar";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { ProjectsList } from "../../ui/ProjectsList";
import { FreeTrialEndingAtInfo } from "../../ui/FreeTrialEndingAtInfo";

export function OrganizationSite() {
    const { organizationId } = useParams<{ organizationId: string }>();

    const [addDialogVisible, setAddDialogVisible] = React.useState(false);

    const { data: organizationData, isLoading: organizationDataLoading } = useOrganization({
        organizationId: organizationId
    });

    return (
        <>
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="organization" />
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 1200 }}>
                    <h1 style={{ display: "flex", alignItems: "center", marginBottom: 0 }}>
                        <OrganizationAvatar organization={organizationData?.data} style={{ marginRight: 16 }} />
                        <div style={{ marginRight: 40 }}>
                            {organizationData?.data && organizationData?.data.attributes.name}
                        </div>
                        <Tooltip
                            title={
                                organizationData?.data?.attributes.project_limit_reached
                                    ? "Project limit reached. Upgrade to a higher plan to create more projects."
                                    : undefined
                            }
                        >
                            <div>
                                <PrimaryButton
                                    data-id="organization-create-project"
                                    onClick={() => {
                                        setAddDialogVisible(true);
                                    }}
                                    disabled={organizationData?.data?.attributes.project_limit_reached}
                                >
                                    Create project
                                </PrimaryButton>
                            </div>
                        </Tooltip>
                    </h1>
                    <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 560 }}>
                            <h3 style={{ marginBottom: 24 }}>Projects</h3>
                            <ProjectsList
                                loading={!!organizationData?.data.attributes.current_user_deactivated}
                                projects={(organizationData?.included || []).filter((included) => {
                                    return included.type === "project";
                                })}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                            <h3>Limits</h3>
                            <FreeTrialEndingAtInfo organizationId={organizationData?.data.id} />
                            <div style={{ display: "flex", gap: 56, marginTop: 24 }}>
                                <Statistic
                                    title="Users"
                                    value={`${organizationData?.data.attributes.active_users_count}/${
                                        organizationData?.data.attributes.user_limit === null
                                            ? "∞"
                                            : organizationData?.data.attributes.user_limit
                                    }`}
                                    loading={organizationDataLoading}
                                />
                                <Statistic
                                    title="Projects"
                                    value={`${organizationData?.data.attributes.project_count}/${
                                        organizationData?.data.attributes.project_limit === null
                                            ? "∞"
                                            : organizationData?.data.attributes.project_limit
                                    }`}
                                    loading={organizationDataLoading}
                                />
                                <Statistic
                                    title="Keys"
                                    value={`${organizationData?.data.attributes.key_count}/${
                                        organizationData?.data.attributes.key_limit === null
                                            ? "∞"
                                            : organizationData?.data.attributes.key_limit
                                    }`}
                                    loading={organizationDataLoading}
                                />
                            </div>
                            <Statistic
                                title="Max languages per project"
                                value={
                                    organizationData?.data.attributes.language_limit_per_project === null
                                        ? "∞"
                                        : organizationData?.data.attributes.language_limit_per_project
                                }
                                loading={organizationDataLoading}
                                style={{ marginTop: 40 }}
                            />
                            <Statistic
                                title="Machine translation characters"
                                value={`${organizationData?.data.attributes.machine_translation_character_usage}/${
                                    organizationData?.data.attributes.machine_translation_character_limit === null
                                        ? "∞"
                                        : organizationData?.data.attributes.machine_translation_character_limit
                                }`}
                                loading={organizationDataLoading}
                                style={{ marginTop: 40 }}
                            />
                        </div>
                    </div>
                </Layout.Content>
            </Layout>

            {organizationData && (
                <NewProjectFormModal
                    organization={organizationData?.data}
                    visible={addDialogVisible}
                    onCancelRequest={() => {
                        setAddDialogVisible(false);
                    }}
                    newProjectFormProps={{
                        organizationId: organizationId,
                        onChanged: (project: IProject) => {
                            history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", project.id));
                        }
                    }}
                />
            )}
        </>
    );
}
