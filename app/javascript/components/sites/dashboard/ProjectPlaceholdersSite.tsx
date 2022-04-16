import { Button, message, Popconfirm, Skeleton } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { BackgroundJobsAPI, IGetBackgroundJobsResponse } from "../../api/v1/BackgroundJobsAPI";
import { PlaceholdersAPI } from "../../api/v1/PlaceholdersAPI";
import { PlaceholderSettingsForm } from "../../forms/PlaceholderSettingsForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
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
                void dashboardStore.reloadCurrentProjectIssuesCount();
                message.success("Checking translations for placeholder issues completed.");
            }
        }
    };

    React.useEffect(() => {
        void loadBackgroundJobs();

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

            <LayoutWithSubSidebarInner smallWidth>
                <Breadcrumbs breadcrumbName="projectPlaceholders" />
                <LayoutWithSubSidebarInnerContent verySmallWidth>
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
                                            await loadBackgroundJobs(),
                                            await dashboardStore.loadBackgroundJobs(params.projectId)
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
                                    loading={recheckingValidations || isAlreadyRecheckingAllValidations()}
                                    style={{ alignSelf: "flex-start", marginBottom: 24 }}
                                >
                                    Check translations for placeholder issues
                                </Button>
                            </Popconfirm>

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
                        </>
                    )}
                </LayoutWithSubSidebarInnerContent>
            </LayoutWithSubSidebarInner>
        </LayoutWithSubSidebar>
    );
}

export { ProjectPlaceholdersSite };
