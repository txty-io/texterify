import { FileTextOutlined } from "@ant-design/icons";
import { Button, Layout, message, Select, Steps } from "antd";
import { ParsedQuery } from "query-string";
import * as React from "react";
import Dropzone from "react-dropzone";
import { useParams } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { IProject, ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { AddEditExportConfigForm } from "../../forms/AddEditExportConfigForm";
import { AddEditLanguageForm } from "../../forms/AddEditLanguageForm";
import { NewOrganizationForm } from "../../forms/NewOrganizationForm";
import { NewProjectForm } from "../../forms/NewProjectForm";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { IOrganization } from "../../stores/DashboardStore";
import { IPlanIDS } from "../../types/IPlan";
import { DropZoneWrapper } from "../../ui/DropZoneWrapper";
import { ExportConfigsTable } from "../../ui/ExportConfigsTable";
import FlagIcon from "../../ui/FlagIcons";
import { useQuery } from "../../ui/KeySearchSettings";
import { LanguagesTable } from "../../ui/LanguagesTable";
import { Licenses } from "../../ui/Licenses";
import { TranslationFileImporter } from "../../ui/TranslationFileImporter";
import { Utils } from "../../ui/Utils";
import { ImportFileFormats } from "./ImportSite";

function SetupSteps(props: {
    current: number;
    project: IProject;
    organization: IOrganization;
    onChange(step: number): void;
}) {
    return (
        <Steps current={props.current} style={{ marginTop: 40 }} onChange={props.onChange}>
            <Steps.Step title="Organization" description="Create an organization to manage users and projects." />
            <Steps.Step title="Plan" description="Select a plan that fits your team." disabled={!props.organization} />
            <Steps.Step title="Project" description="Add a new localization project." disabled={!props.organization} />
            <Steps.Step
                title="Languages"
                description="Set languages you want your project to be translated in."
                disabled={!props.organization || !props.project}
            />
            <Steps.Step
                title="Import"
                description="Import your keys and translations."
                disabled={!props.organization || !props.project}
            />
            <Steps.Step
                title="Integrations"
                description="Install and configure the CLI tool and other integrations."
                disabled={!props.organization || !props.project}
            />
        </Steps>
    );
}

const STEPS = {
    ORGANIZATION: 0,
    PLAN: 1,
    PROJECT: 2,
    LANGUAGES: 3,
    IMPORT: 4,
    INTEGRATIONS: 5
};

function StepWrapper(props: {
    title: string;
    description?: string;
    backTo?: string;
    nextTo?: string;
    buttons: React.ReactNode;
    children: React.ReactNode;
    fullWidth?: boolean;
    onBack?(): void;
}) {
    return (
        <div style={{ maxWidth: props.fullWidth ? undefined : 640, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
                {props.backTo && (
                    <Button
                        style={{ marginRight: 40 }}
                        onClick={() => {
                            history.push({ pathname: props.backTo, search: history.location.search });

                            if (props.onBack) {
                                props.onBack();
                            }
                        }}
                    >
                        Go back
                    </Button>
                )}
                {props.nextTo && (
                    <Button
                        style={{ marginLeft: "auto" }}
                        onClick={() => {
                            history.push({ pathname: props.nextTo, search: history.location.search });
                        }}
                    >
                        Next
                    </Button>
                )}
            </div>
            <h1 style={{ marginTop: 40 }}>{props.title}</h1>
            {props.description && <p>{props.description}</p>}
            <div style={{ marginTop: 24, borderRadius: 4 }}>{props.children}</div>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>{props.buttons}</div>
        </div>
    );
}

function goToStep(options: {
    step: number;
    organization?: IOrganization;
    project?: IProject;
    currentQueryParams: ParsedQuery<string>;
}) {
    if (!options.organization) {
        return null;
    }

    let url: string;
    let addProjectIdToUrl: boolean;

    if (options.step === STEPS.ORGANIZATION) {
        if (options.organization) {
            url = Routes.DASHBOARD.SETUP_ORGANIZATION_RESOLVER({ organizationId: options.organization.id });
            addProjectIdToUrl = true;
        } else {
            url = Routes.DASHBOARD.SETUP_ORGANIZATION_NEW;
        }
    } else if (options.step === STEPS.PLAN) {
        url = Routes.DASHBOARD.SETUP_PLAN_RESOLVER({
            organizationId: options.organization.id
        });
        addProjectIdToUrl = true;
    } else if (options.step === STEPS.PROJECT) {
        if (options.project) {
            url = Routes.DASHBOARD.SETUP_PROJECT_RESOLVER({
                organizationId: options.organization.id,
                projectId: options.project.id
            });
        } else {
            url = Routes.DASHBOARD.SETUP_PROJECT_NEW_RESOLVER({ organizationId: options.organization.id });
        }
    } else if (options.step === STEPS.LANGUAGES && options.project) {
        url = Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES_RESOLVER({
            organizationId: options.organization.id,
            projectId: options.project.id
        });
    } else if (options.step === STEPS.IMPORT && options.project) {
        url = Routes.DASHBOARD.SETUP_PROJECT_IMPORT_RESOLVER({
            organizationId: options.organization.id,
            projectId: options.project.id
        });
    } else if (options.step === STEPS.INTEGRATIONS) {
        url = Routes.DASHBOARD.SETUP_PROJECT_INTEGRATIONS_RESOLVER({
            organizationId: options.organization.id,
            projectId: options.project.id
        });
    }

    if (addProjectIdToUrl && options.project) {
        history.push({
            pathname: url,
            search: Utils.createQueryParamsFromObject({
                add: [{ key: "project", value: options.project.id }],
                currentParams: options.currentQueryParams
            }).toString()
        });
    } else {
        history.push({ pathname: url, search: history.location.search });
    }
}

export function SetupSite(props: { step: number }) {
    const params = useParams<{ organizationId?: string; projectId?: string }>();
    const currentQueryParams = useQuery();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [organization, setOrganization] = React.useState<IOrganization>();
    const [project, setProject] = React.useState<IProject>();
    const [languagesTableReloader, setLanguagesTableReloader] = React.useState<number>(0);
    const [exportConfigsReloader, setExportConfigsReloader] = React.useState<number>(0);
    const [selectedPlan, setSelectedPlan] = React.useState<IPlanIDS>((currentQueryParams.plan as IPlanIDS) || "basic");

    const projectId = params.projectId || (currentQueryParams.project as string);

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

            if (projectId) {
                try {
                    const projectResponse = await ProjectsAPI.getProject(projectId);
                    setProject(projectResponse.data);
                } catch (error) {
                    console.error(error);
                    message.error("Failed to load project.");
                }
            }

            if (currentQueryParams.plan) {
                setSelectedPlan(currentQueryParams.plan as IPlanIDS);
            }
        })();
    }, []);

    React.useEffect(() => {
        if (params.projectId) {
            history.replace({
                search: Utils.createQueryParamsFromObject({
                    currentParams: currentQueryParams,
                    remove: ["project"]
                }).toString()
            });
        }
    }, [props.step]);

    React.useEffect(() => {
        history.replace({
            search: Utils.createQueryParamsFromObject({
                add: [{ key: "plan", value: selectedPlan }],
                currentParams: currentQueryParams
            }).toString()
        });
    }, [selectedPlan]);

    function getNextStep(options?: { organization: IOrganization; step?: number }) {
        const org = organization || options?.organization;

        if (!org) {
            return null;
        }

        if (props.step === STEPS.ORGANIZATION) {
            return Routes.DASHBOARD.SETUP_PLAN_RESOLVER({ organizationId: org.id });
        } else if (props.step === STEPS.PLAN) {
            if (project) {
                return Routes.DASHBOARD.SETUP_PROJECT_RESOLVER({
                    organizationId: org.id,
                    projectId: project.id
                });
            } else {
                return Routes.DASHBOARD.SETUP_PROJECT_NEW_RESOLVER({ organizationId: org.id });
            }
        } else if (props.step === STEPS.PROJECT && project) {
            return Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES_RESOLVER({
                organizationId: org.id,
                projectId: project.id
            });
        } else if (props.step === STEPS.LANGUAGES && project) {
            return Routes.DASHBOARD.SETUP_PROJECT_IMPORT_RESOLVER({
                organizationId: org.id,
                projectId: project.id
            });
        } else if (props.step === STEPS.IMPORT && project) {
            return Routes.DASHBOARD.SETUP_PROJECT_INTEGRATIONS_RESOLVER({
                organizationId: org.id,
                projectId: project.id
            });
        }
    }

    function getPreviousStep() {
        if (!organization) {
            return null;
        }

        if (props.step === STEPS.ORGANIZATION) {
            return null;
        } else if (props.step === STEPS.PLAN) {
            return Routes.DASHBOARD.SETUP_ORGANIZATION_RESOLVER({ organizationId: organization.id });
        } else if (props.step === STEPS.PROJECT) {
            return Routes.DASHBOARD.SETUP_PLAN_RESOLVER({ organizationId: organization.id });
        } else if (props.step === STEPS.LANGUAGES && project) {
            return Routes.DASHBOARD.SETUP_PROJECT_RESOLVER({
                organizationId: organization.id,
                projectId: project.id
            });
        } else if (props.step === STEPS.IMPORT && project) {
            return Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES_RESOLVER({
                organizationId: organization.id,
                projectId: project.id
            });
        } else if (props.step === STEPS.INTEGRATIONS && project) {
            return Routes.DASHBOARD.SETUP_PROJECT_IMPORT_RESOLVER({
                organizationId: organization.id,
                projectId: project.id
            });
        }
    }

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "auto", width: "100%", maxWidth: 1400 }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <SetupSteps
                    current={props.step}
                    onChange={(step) => {
                        goToStep({
                            step: step,
                            organization: organization,
                            project: project,
                            currentQueryParams: currentQueryParams
                        });
                    }}
                    project={project}
                    organization={organization}
                />
                {props.step === 0 && (
                    <StepWrapper
                        title={params.organizationId ? "Edit organization details" : "Create an organization"}
                        description="Organizations help you to translate projects together with your team and manage your subscription."
                        nextTo={getNextStep()}
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
                        fullWidth
                    >
                        {(organization || !params.organizationId) && (
                            <NewOrganizationForm
                                isEdit={!!params.organizationId}
                                organizationToEdit={organization}
                                onChanged={(newOrganization, isNew) => {
                                    setLoading(false);
                                    setOrganization(newOrganization);
                                    history.push({
                                        pathname: getNextStep({ organization: newOrganization }),
                                        search: history.location.search
                                    });
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
                        title="Select a plan that fits your team"
                        description="You can always change you plan later on."
                        backTo={getPreviousStep()}
                        nextTo={getNextStep()}
                        buttons={
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={() => {
                                    history.push({ pathname: getNextStep(), search: history.location.search });
                                }}
                            >
                                Continue with selection
                            </Button>
                        }
                        fullWidth
                    >
                        <Licenses
                            hostingType="cloud"
                            organizationId={params.organizationId}
                            selected={selectedPlan}
                            hideSelectButtons
                            selectByPlanClick
                            onChangePlan={(plan) => {
                                setSelectedPlan(plan.id);
                            }}
                        />
                    </StepWrapper>
                )}

                {props.step === 2 && (
                    <StepWrapper
                        title={projectId ? "Edit project details" : "Create a project"}
                        description="Create your translation project."
                        backTo={getPreviousStep()}
                        onBack={() => {
                            if (project) {
                                history.replace({
                                    search: Utils.createQueryParamsFromObject({
                                        add: [{ key: "project", value: project.id }],
                                        currentParams: currentQueryParams
                                    }).toString()
                                });
                            }
                        }}
                        nextTo={getNextStep()}
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
                                {projectId ? "Update project" : "Create project"}
                            </Button>
                        }
                        fullWidth
                    >
                        {organization && (project || !projectId) && (
                            <NewProjectForm
                                isEdit={!!projectId}
                                projectToEdit={project}
                                organizationId={organization.id}
                                onChanged={(newProject, isNew) => {
                                    setLoading(false);
                                    setProject(newProject);

                                    history.push({
                                        pathname: Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES_RESOLVER({
                                            organizationId: params.organizationId,
                                            projectId: newProject.id
                                        }),
                                        search: Utils.createQueryParamsFromObject({
                                            currentParams: currentQueryParams,
                                            remove: ["project"]
                                        }).toString()
                                    });

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

                {props.step === 3 && (
                    <StepWrapper
                        title="Add languages"
                        backTo={getPreviousStep()}
                        nextTo={getNextStep()}
                        buttons={
                            <Button
                                type="primary"
                                onClick={() => {
                                    history.push({ pathname: getNextStep(), search: history.location.search });
                                }}
                            >
                                Next
                            </Button>
                        }
                        fullWidth
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 2fr",
                                columnGap: 40,
                                rowGap: 40
                            }}
                        >
                            <AddEditLanguageForm
                                projectId={projectId}
                                onCreated={async () => {
                                    setLanguagesTableReloader(languagesTableReloader + 1);
                                }}
                                clearFieldsAfterSubmit
                            />

                            {project && <LanguagesTable project={project} tableReloader={languagesTableReloader} />}
                        </div>
                    </StepWrapper>
                )}

                {props.step === 4 && (
                    <StepWrapper
                        title="Import your content"
                        backTo={getPreviousStep()}
                        nextTo={getNextStep()}
                        buttons={
                            <Button
                                type="primary"
                                onClick={() => {
                                    history.push({ pathname: getNextStep(), search: history.location.search });
                                }}
                            >
                                Next
                            </Button>
                        }
                        fullWidth
                    >
                        <TranslationFileImporter />
                    </StepWrapper>
                )}

                {props.step === 5 && (
                    <StepWrapper
                        title="Integrations"
                        backTo={getPreviousStep()}
                        buttons={
                            <Button
                                type="primary"
                                onClick={() => {
                                    history.push({ pathname: getNextStep(), search: history.location.search });
                                }}
                            >
                                Next
                            </Button>
                        }
                        fullWidth
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 2fr",
                                columnGap: 40,
                                rowGap: 40
                            }}
                        >
                            <AddEditExportConfigForm
                                projectId={projectId}
                                onCreated={async () => {
                                    setExportConfigsReloader(exportConfigsReloader + 1);
                                }}
                                clearFieldsAfterSubmit
                            />

                            {project && <ExportConfigsTable project={project} tableReloader={exportConfigsReloader} />}
                        </div>
                    </StepWrapper>
                )}
            </Layout.Content>
        </Layout>
    );
}
