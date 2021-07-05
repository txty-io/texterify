import { Button, Layout, message, Result, Steps } from "antd";
import { ParsedQuery } from "query-string";
import * as React from "react";
import { useParams } from "react-router";
import { ISubscription, OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { IProject, ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { MESSAGE_DURATION_IMPORTANT } from "../../configs/MessageDurations";
import { AddEditLanguageForm } from "../../forms/AddEditLanguageForm";
import { NewOrganizationForm } from "../../forms/NewOrganizationForm";
import { NewProjectForm } from "../../forms/NewProjectForm";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { subscriptionService } from "../../services/SubscriptionService";
import { IOrganization } from "../../stores/DashboardStore";
import { IPlanIDS } from "../../types/IPlan";
import { useQuery } from "../../ui/KeySearchSettings";
import { LanguagesTable } from "../../ui/LanguagesTable";
import { getPlanById, handleCheckout, Licenses } from "../../ui/Licenses";
import { TranslationFileImporter } from "../../ui/TranslationFileImporter";
import { Utils } from "../../ui/Utils";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";

let STEPS: {
    ORGANIZATION: number;
    PLAN?: number;
    PROJECT: number;
    LANGUAGES: number;
    IMPORT: number;
    INTEGRATIONS?: number;
    SUCCESS: number;
};

if (IS_TEXTERIFY_CLOUD) {
    STEPS = {
        ORGANIZATION: 0,
        PLAN: 1,
        PROJECT: 2,
        LANGUAGES: 3,
        IMPORT: 4,
        SUCCESS: 5
    };
} else {
    STEPS = {
        ORGANIZATION: 0,
        PROJECT: 1,
        LANGUAGES: 2,
        IMPORT: 3,
        SUCCESS: 4
    };
}

function SetupSteps(props: {
    current: number;
    project: IProject;
    organization: IOrganization;
    subscription: ISubscription;
    onChange(step: number): void;
}) {
    return (
        <Steps current={props.current} style={{ marginTop: 40 }} onChange={props.onChange}>
            {STEPS.ORGANIZATION !== undefined && <Steps.Step title="Organization" />}
            {STEPS.PLAN !== undefined && (
                <Steps.Step
                    title="Plan"
                    // description="Select a plan that fits your team."
                    disabled={!props.organization}
                />
            )}
            {STEPS.PROJECT !== undefined && (
                <Steps.Step
                    title="Project"
                    // description="Add a new localization project."
                    disabled={!props.organization || !props.project}
                />
            )}
            {STEPS.LANGUAGES !== undefined && (
                <Steps.Step
                    title="Languages"
                    // description="Set languages you want your project to be translated in."
                    disabled={!props.organization || !props.project}
                />
            )}
            {STEPS.IMPORT !== undefined && (
                <Steps.Step
                    title="Import"
                    // description="Import your keys and translations."
                    disabled={!props.organization || !props.project}
                />
            )}
            {STEPS.SUCCESS !== undefined && (
                <Steps.Step
                    title="Success"
                    // description="Install and configure the CLI tool and other integrations."
                    disabled={!props.organization || !props.project}
                />
            )}
        </Steps>
    );
}

function StepWrapper(props: {
    title?: string;
    description?: React.ReactNode;
    backTo?: string;
    nextTo?: string;
    buttons?: React.ReactNode;
    children: React.ReactNode;
    fullWidth?: boolean;
    onBack?(): void;
}) {
    return (
        <div
            style={{
                maxWidth: props.fullWidth ? undefined : 640,
                display: "flex",
                flexDirection: "column",
                flexGrow: 1
            }}
        >
            {(props.backTo || props.nextTo) && (
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
            )}
            {props.title && <h1 style={{ marginTop: 40 }}>{props.title}</h1>}
            {props.description && <p>{props.description}</p>}
            <div style={{ marginTop: 24, borderRadius: 4, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                {props.children}
            </div>
            {props.buttons && (
                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>{props.buttons}</div>
            )}
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
    const [subscriptionUpdating, setSubscriptionUpdating] = React.useState<boolean>(false);
    const [organization, setOrganization] = React.useState<IOrganization>();
    const [subscription, setSubscription] = React.useState<ISubscription>();
    const [project, setProject] = React.useState<IProject>();
    const [languagesTableReloader, setLanguagesTableReloader] = React.useState<number>(0);
    const [selectedPlan, setSelectedPlan] = React.useState<IPlanIDS>("basic");

    const projectId = params.projectId || (currentQueryParams.project as string);

    async function loadSubscription(org: IOrganization) {
        setLoading(true);

        try {
            const activeSubscription = await subscriptionService.getActiveSubscription(org.id, {
                forceReload: true
            });

            setSubscription(activeSubscription);

            if (activeSubscription) {
                setSelectedPlan(activeSubscription.attributes.plan);
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to load subscription.");
        }

        setLoading(false);
    }

    async function loadOrganizationAndSubscription() {
        setLoading(true);

        try {
            const organizationResponse = await OrganizationsAPI.getOrganization(params.organizationId);
            setOrganization(organizationResponse.data);

            await loadSubscription(organizationResponse.data);
        } catch (error) {
            console.error(error);
            message.error("Failed to load organization.");
        }

        setLoading(false);
    }

    React.useEffect(() => {
        (async () => {
            if (params.organizationId) {
                await loadOrganizationAndSubscription();
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

            // if (currentQueryParams.plan) {
            //     setSelectedPlan(currentQueryParams.plan as IPlanIDS);
            // }
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

    // React.useEffect(() => {
    //     history.replace({
    //         search: Utils.createQueryParamsFromObject({
    //             add: [{ key: "plan", value: selectedPlan }],
    //             currentParams: currentQueryParams
    //         }).toString()
    //     });
    // }, [selectedPlan]);

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
        <Layout style={{ padding: "0 24px 160px", margin: "auto", width: "100%", maxWidth: 1400 }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <h1>Create a new organization</h1>
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
                    subscription={subscription}
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
                                data-id="new-organization-form-create-organization"
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

                {props.step === STEPS.PLAN && (
                    <StepWrapper
                        title="Select a plan that fits your team"
                        description="You can always change you plan later on."
                        backTo={getPreviousStep()}
                        // nextTo={getNextStep()}
                        buttons={
                            <Button
                                type="primary"
                                loading={loading || subscriptionUpdating}
                                onClick={async () => {
                                    if (
                                        (selectedPlan === "free" && !subscription) ||
                                        selectedPlan === subscription?.attributes.plan
                                    ) {
                                        history.push({ pathname: getNextStep(), search: history.location.search });
                                    } else {
                                        if (subscription) {
                                            setSubscriptionUpdating(true);
                                            try {
                                                if (selectedPlan === "free") {
                                                    await OrganizationsAPI.cancelOrganizationSubscription(
                                                        organization.id
                                                    );
                                                    setSubscription(null);
                                                } else {
                                                    await OrganizationsAPI.changeOrganizationSubscriptionPlan(
                                                        organization.id,
                                                        selectedPlan
                                                    );
                                                    await loadSubscription(organization);
                                                }

                                                message.success(
                                                    "Successfully changed subscription plan.",
                                                    MESSAGE_DURATION_IMPORTANT
                                                );

                                                history.push({
                                                    pathname: getNextStep(),
                                                    search: history.location.search
                                                });
                                            } catch (error) {
                                                console.error(error);
                                                message.error("Failed to change subscription plan");
                                            }
                                            setSubscriptionUpdating(false);
                                        } else {
                                            setSubscriptionUpdating(true);
                                            await handleCheckout(getPlanById(selectedPlan), "cloud", {
                                                organizationId: organization.id,
                                                cancelUrl: history.location.pathname + history.location.search,
                                                successUrl: getNextStep()
                                            });
                                            setSubscriptionUpdating(false);
                                        }
                                    }
                                }}
                            >
                                {project || subscription ? "Change plan" : "Select plan"}
                            </Button>
                        }
                        fullWidth
                    >
                        {!loading && (
                            <Licenses
                                hostingType="cloud"
                                organizationId={params.organizationId}
                                selected={selectedPlan}
                                hideSelectButtons
                                selectByPlanClick
                                onChangePlan={(plan) => {
                                    setSelectedPlan(plan.id);
                                }}
                                showFreeTrial
                            />
                        )}
                    </StepWrapper>
                )}

                {props.step === STEPS.PROJECT && (
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

                {props.step === STEPS.LANGUAGES && (
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

                {props.step === STEPS.IMPORT && (
                    <StepWrapper
                        title="Import your content"
                        description={
                            <>
                                If you already have some translations you can import them now.
                                <br />
                                Don't worry, you can also import them later at any time.
                            </>
                        }
                        backTo={getPreviousStep()}
                        nextTo={getNextStep()}
                        buttons={
                            <Button
                                onClick={() => {
                                    history.push({ pathname: getNextStep(), search: history.location.search });
                                }}
                                style={{ marginTop: 24 }}
                                type="primary"
                            >
                                Next
                            </Button>
                        }
                        fullWidth
                    >
                        <TranslationFileImporter
                            onCreateLanguageClick={() => {
                                history.push({ pathname: getPreviousStep(), search: history.location.search });
                            }}
                        />
                    </StepWrapper>
                )}

                {props.step === STEPS.SUCCESS && (
                    <StepWrapper
                        // title="Integrations"
                        backTo={getPreviousStep()}
                        // buttons={
                        //     <Button
                        //         onClick={() => {
                        //             history.push({ pathname: getNextStep(), search: history.location.search });
                        //         }}
                        //     >
                        //         Skip integrations
                        //     </Button>
                        // }
                        fullWidth
                    >
                        {/* <div
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
                        </div> */}
                        <Result
                            status="success"
                            title="Everything is set up."
                            subTitle="You are ready to start translating your project."
                            style={{ margin: "auto" }}
                            extra={[
                                <Button
                                    type="primary"
                                    key="go-to-project"
                                    onClick={() => {
                                        history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", project.id));
                                    }}
                                >
                                    Go to your project
                                </Button>
                            ]}
                        />
                    </StepWrapper>
                )}
            </Layout.Content>
        </Layout>
    );
}
