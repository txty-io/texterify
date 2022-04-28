import { Button, message, Popconfirm, Skeleton } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { BackgroundJobsAPI, IGetBackgroundJobsResponse } from "../../api/v1/BackgroundJobsAPI";
import { PlaceholdersAPI } from "../../api/v1/PlaceholdersAPI";
import { IGetValidationViolationsCountResponse, ValidationViolationsAPI } from "../../api/v1/ValidationViolationsAPI";
import { PlaceholderSettingsForm } from "../../forms/PlaceholderSettingsForm";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { IssuesTag } from "../../ui/IssuesTag";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { ValidationsSidebar } from "../../ui/ValidationsSidebar";
import {
    PUBSUB_CHECK_PLACEHOLDERS_FINISHED,
    PUBSUB_CHECK_PLACEHOLDERS_PROGRESS,
    PUBSUB_EVENTS
} from "../../utilities/PubSubEvents";

let eventSubscriptionFinished: string;
let eventSubscriptionProgress: string;

function ProjectPlaceholdersSite() {
    const params = useParams<{ projectId: string }>();

    const [loading, setLoading] = React.useState<boolean>(false);
    const [recheckingValidations, setRecheckingValidations] = React.useState<boolean>(false);
    const [getBackgroundJobsResponse, setGetBackgroundJobsResponse] = React.useState<IGetBackgroundJobsResponse>(null);
    const [validationViolationsLoading, setValidationViolationsLoading] = React.useState<boolean>(false);
    const [validationViolationsCountResponse, setValidationViolationsCountResponse] =
        React.useState<IGetValidationViolationsCountResponse>(null);

    async function fetchValidationViolations() {
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS")) {
            setValidationViolationsLoading(true);

            try {
                const response = await ValidationViolationsAPI.getCount({
                    projectId: params.projectId
                });

                if (dashboardStore.currentProject) {
                    dashboardStore.currentProject.attributes.issues_count = response.total;
                }

                setValidationViolationsCountResponse(response);
            } catch (error) {
                console.error(error);
                message.error("Failed to load violations.");
            }
        }

        setValidationViolationsLoading(false);
    }

    async function loadBackgroundJobs() {
        try {
            const response = await BackgroundJobsAPI.getBackgroundJobs(params.projectId, {
                status: ["CREATED", "RUNNING"],
                jobTypes: ["CHECK_PLACEHOLDERS"]
            });
            setGetBackgroundJobsResponse(response);
        } catch (e) {
            console.error(e);
        }
    }

    const onPubSubEvent = (event: PUBSUB_EVENTS, data: { projectId: string }) => {
        if (data.projectId === params.projectId) {
            void loadBackgroundJobs();

            if (event === PUBSUB_CHECK_PLACEHOLDERS_FINISHED) {
                void fetchValidationViolations();
                void dashboardStore.reloadCurrentProjectIssuesCount();
                message.success("Checking translations for placeholder issues completed.");
            }
        }
    };

    React.useEffect(() => {
        void Promise.all([loadBackgroundJobs(), fetchValidationViolations()]);

        eventSubscriptionFinished = PubSub.subscribe(PUBSUB_CHECK_PLACEHOLDERS_FINISHED, onPubSubEvent);
        eventSubscriptionProgress = PubSub.subscribe(PUBSUB_CHECK_PLACEHOLDERS_PROGRESS, onPubSubEvent);

        return () => {
            if (eventSubscriptionFinished) {
                PubSub.unsubscribe(eventSubscriptionFinished);
            }

            if (eventSubscriptionProgress) {
                PubSub.unsubscribe(eventSubscriptionProgress);
            }
        };
    }, []);

    function isAlreadyRecheckingAllValidations() {
        return getBackgroundJobsResponse?.meta?.total > 0;
    }

    return (
        <LayoutWithSubSidebar>
            <ValidationsSidebar projectId={params.projectId} />

            <LayoutWithSubSidebarInner>
                <Breadcrumbs breadcrumbName="projectPlaceholders" />
                <LayoutWithSubSidebarInnerContent>
                    <h1>Placeholders</h1>
                    <p>Define the format of your placeholders.</p>

                    {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                        <FeatureNotAvailable
                            feature="FEATURE_VALIDATIONS"
                            dataId="FEATURE_VALIDATIONS_NOT_AVAILABLE"
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    {!dashboardStore.currentProject && <Skeleton active />}
                    {dashboardStore.currentProject && (
                        <>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <IssuesTag
                                    loading={validationViolationsLoading}
                                    projectId={params.projectId}
                                    issuesCount={validationViolationsCountResponse?.total || 0}
                                />

                                <Link
                                    to={Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE.replace(":projectId", params.projectId)}
                                    style={{ marginLeft: 24, marginRight: 40 }}
                                >
                                    View issues
                                </Link>
                                <Popconfirm
                                    title="Do you want to check your translations for placeholder issues?"
                                    onConfirm={async () => {
                                        setRecheckingValidations(true);

                                        try {
                                            await PlaceholdersAPI.checkPlaceholders({
                                                projectId: params.projectId
                                            });
                                            message.success(
                                                "Successfully queued job to check translations for placeholder issues."
                                            );
                                            await Promise.all([
                                                loadBackgroundJobs(),
                                                dashboardStore.loadBackgroundJobs(params.projectId)
                                            ]);
                                        } catch (error) {
                                            console.error(error);
                                            message.error(
                                                "Failed to queue job for checking translations for placeholder issues."
                                            );
                                        }

                                        setRecheckingValidations(false);
                                    }}
                                    okText="Yes"
                                    cancelText="No"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button
                                        type="primary"
                                        data-id="check-placeholders-of-all-keys-button"
                                        disabled={
                                            !getBackgroundJobsResponse ||
                                            !dashboardStore.featureEnabled("FEATURE_VALIDATIONS")
                                        }
                                        loading={
                                            recheckingValidations || isAlreadyRecheckingAllValidations() || loading
                                        }
                                        style={{ marginLeft: 80 }}
                                    >
                                        Check translations for placeholder issues
                                    </Button>
                                </Popconfirm>
                            </div>

                            <div style={{ maxWidth: 480, display: "flex", flexDirection: "column" }}>
                                <PlaceholderSettingsForm
                                    projectId={params.projectId}
                                    placeholderStart={dashboardStore.currentProject.attributes.placeholder_start}
                                    placeholderEnd={dashboardStore.currentProject.attributes.placeholder_end}
                                    onSaving={() => {
                                        setLoading(true);
                                    }}
                                    onSaved={() => {
                                        setLoading(false);
                                    }}
                                    style={{ marginTop: 24 }}
                                />

                                <Button
                                    form="placeholderSettingsForm"
                                    type="primary"
                                    htmlType="submit"
                                    style={{ alignSelf: "flex-end" }}
                                    loading={loading}
                                    disabled={!dashboardStore.featureEnabled("FEATURE_VALIDATIONS")}
                                >
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </LayoutWithSubSidebarInnerContent>
            </LayoutWithSubSidebarInner>
        </LayoutWithSubSidebar>
    );
}

export { ProjectPlaceholdersSite };
