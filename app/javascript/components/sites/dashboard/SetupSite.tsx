import { Button, Layout, message, Steps } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { IProject, ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { AddEditLanguageForm } from "../../forms/AddEditLanguageForm";
import { NewOrganizationForm } from "../../forms/NewOrganizationForm";
import { NewProjectForm } from "../../forms/NewProjectForm";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { IOrganization } from "../../stores/DashboardStore";
import { LanguagesTable } from "../../ui/LanguagesTable";

function SetupSteps(props: { current: number }) {
    return (
        <Steps current={props.current} style={{ marginTop: 40 }}>
            <Steps.Step title="Organization" description="Create an organization." />
            <Steps.Step title="Project" description="Add a new localization project." />
            <Steps.Step title="Languages" description="Add some languages you want your project to be translated in." />
            <Steps.Step title="Integrations" description="Install and configure the CLI tool and other integrations." />
            <Steps.Step title="Finished" description="Everything is set up." />
        </Steps>
    );
}

function StepWrapper(props: {
    title: string;
    description: string;
    backTo?: string;
    nextTo?: string;
    buttons: React.ReactNode;
    children: React.ReactNode;
    fullWidth?: boolean;
}) {
    return (
        <div style={{ maxWidth: props.fullWidth ? undefined : 640, margin: "auto", marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                {props.backTo && (
                    <Button
                        style={{ marginRight: 40 }}
                        onClick={() => {
                            history.push(props.backTo);
                        }}
                    >
                        Go back
                    </Button>
                )}
                {props.nextTo && (
                    <Button
                        style={{ marginLeft: "auto" }}
                        onClick={() => {
                            history.push(props.nextTo);
                        }}
                    >
                        Next
                    </Button>
                )}
            </div>
            <h1 style={{ marginTop: 24 }}>{props.title}</h1>
            <p>{props.description}</p>
            <div style={{ marginTop: 24, borderRadius: 4 }}>{props.children}</div>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>{props.buttons}</div>
        </div>
    );
}

export function SetupSite(props: { step: number }) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [organization, setOrganization] = React.useState<IOrganization>();
    const [project, setProject] = React.useState<IProject>();
    const [languagesTableReloader, setLanguagesTableReloader] = React.useState<number>(0);

    const params = useParams<{ organizationId?: string; projectId?: string }>();

    React.useEffect(() => {
        (async () => {
            if (params.organizationId) {
                try {
                    const organizationResponse = await OrganizationsAPI.getOrganization(params.organizationId);
                    setOrganization(organizationResponse.data);
                } catch (error) {
                    console.error(error);
                    message.error("Failed to load organization.");
                }
            }

            if (params.projectId) {
                try {
                    const projectResponse = await ProjectsAPI.getProject(params.projectId);
                    setProject(projectResponse.data);
                } catch (error) {
                    console.error(error);
                    message.error("Failed to load project.");
                }
            }
        })();
    }, []);

    console.error(
        organization
            ? project
                ? Routes.DASHBOARD.SETUP_PROJECT.replace(":organizationId", organization.id).replace(
                      ":projectId",
                      project.id
                  )
                : Routes.DASHBOARD.SETUP_PROJECT_NEW.replace(":organizationId", organization.id)
            : null
    );

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "auto", width: "100%", maxWidth: 1200 }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <SetupSteps current={props.step} />
                {props.step === 0 && (
                    <StepWrapper
                        title={params.organizationId ? "Edit your organization" : "Create an organization"}
                        description="Organizations help you to translate projects together with your team and manage your subscription."
                        nextTo={
                            organization
                                ? project
                                    ? Routes.DASHBOARD.SETUP_PROJECT.replace(
                                          ":organizationId",
                                          organization.id
                                      ).replace(":projectId", project.id)
                                    : Routes.DASHBOARD.SETUP_PROJECT_NEW.replace(":organizationId", organization.id)
                                : null
                        }
                        buttons={
                            <Button
                                type="primary"
                                htmlType="submit"
                                form="newOrganizationForm"
                                loading={loading}
                                onClick={() => {
                                    setLoading(true);
                                }}
                            >
                                {params.organizationId ? "Update organization" : "Create organization"}
                            </Button>
                        }
                    >
                        {(organization || !params.organizationId) && (
                            <NewOrganizationForm
                                isEdit={!!params.organizationId}
                                organizationToEdit={organization}
                                onChanged={(newOrganization, isNew) => {
                                    setLoading(false);
                                    if (project) {
                                        history.push(
                                            Routes.DASHBOARD.SETUP_PROJECT.replace(
                                                ":organizationId",
                                                newOrganization.id
                                            ).replace(":projectId", project.id)
                                        );
                                    } else {
                                        history.push(
                                            Routes.DASHBOARD.SETUP_PROJECT_NEW.replace(
                                                ":organizationId",
                                                newOrganization.id
                                            )
                                        );
                                    }
                                    setOrganization(newOrganization);
                                    if (isNew) {
                                        message.success("Successfully created organization.");
                                    } else {
                                        message.success("Successfully updated organization.");
                                    }
                                }}
                                onError={() => {
                                    setLoading(false);
                                    message.error("Error while creating organization.");
                                }}
                                onValidationsFailed={() => {
                                    setLoading(false);
                                }}
                            />
                        )}
                    </StepWrapper>
                )}

                {props.step === 1 && (
                    <StepWrapper
                        title={params.projectId ? "Update project" : "Create a project"}
                        description="Create your translation project."
                        backTo={Routes.DASHBOARD.SETUP_ORGANIZATION_RESOLVER({
                            organizationId: params.organizationId
                        })}
                        nextTo={
                            organization && project
                                ? Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES_RESOLVER({
                                      organizationId: params.organizationId,
                                      projectId: project.id
                                  })
                                : null
                        }
                        buttons={
                            <Button
                                type="primary"
                                htmlType="submit"
                                form="newProjectForm"
                                loading={loading}
                                onClick={() => {
                                    setLoading(true);
                                }}
                            >
                                {params.projectId ? "Update project" : "Create project"}
                            </Button>
                        }
                    >
                        {organization && (project || !params.projectId) && (
                            <NewProjectForm
                                isEdit={!!params.projectId}
                                projectToEdit={project}
                                organizationId={organization.id}
                                onChanged={(newProject, isNew) => {
                                    setLoading(false);
                                    history.push(
                                        Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES_RESOLVER({
                                            organizationId: params.organizationId,
                                            projectId: newProject.id
                                        })
                                    );
                                    setProject(newProject);

                                    if (isNew) {
                                        message.success("Successfully created project.");
                                    } else {
                                        message.success("Successfully updated project.");
                                    }
                                }}
                                onError={() => {
                                    setLoading(false);
                                    message.error("Error while creating project.");
                                }}
                                onValidationsFailed={() => {
                                    setLoading(false);
                                }}
                            />
                        )}
                    </StepWrapper>
                )}

                {props.step === 2 && (
                    <StepWrapper
                        title="Add languages"
                        description="Create your translation project."
                        backTo={Routes.DASHBOARD.SETUP_PROJECT_RESOLVER({
                            organizationId: params.organizationId,
                            projectId: params.projectId
                        })}
                        buttons={<Button type="primary">Next</Button>}
                        fullWidth
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", columnGap: 40 }}>
                            <AddEditLanguageForm
                                projectId={params.projectId}
                                onCreated={async () => {
                                    setLanguagesTableReloader(languagesTableReloader + 1);
                                }}
                                clearFieldsAfterSubmit
                            />

                            {project && <LanguagesTable project={project} tableReloader={languagesTableReloader} />}
                        </div>
                    </StepWrapper>
                )}
            </Layout.Content>
        </Layout>
    );
}
