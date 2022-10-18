import { Button, message, Popconfirm } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { BackgroundJobsAPI, IGetBackgroundJobsResponse } from "../api/v1/BackgroundJobsAPI";
import { PlaceholdersAPI } from "../api/v1/PlaceholdersAPI";
import { ValidationsAPI } from "../api/v1/ValidationsAPI";
import { IGetValidationViolationsCountResponse, ValidationViolationsAPI } from "../api/v1/ValidationViolationsAPI";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import {
    PUBSUB_CHECK_PLACEHOLDERS_FINISHED,
    PUBSUB_CHECK_PLACEHOLDERS_PROGRESS,
    PUBSUB_EVENTS,
    PUBSUB_RECHECK_ALL_VALIDATIONS_FINISHED,
    PUBSUB_RECHECK_ALL_VALIDATIONS_PROGRESS
} from "../utilities/PubSubEvents";
import { IssuesTag } from "./IssuesTag";

interface IProps {
    projectId: string;
    checkFor: "validations" | "placeholders" | "all";
}

interface IState {
    validationViolationsCountResponse: IGetValidationViolationsCountResponse;
    validationViolationsLoading: boolean;
    checkingValidations: boolean;
    getBackgroundJobsResponse: IGetBackgroundJobsResponse;
}

@observer
export class ValidationSiteHeader extends React.Component<IProps, IState> {
    state: IState = {
        validationViolationsCountResponse: null,
        validationViolationsLoading: true,
        checkingValidations: false,
        getBackgroundJobsResponse: null
    };

    eventValidationSubscriptionFinished: string;
    eventValidationSubscriptionProgress: string;

    eventPlaceholderSubscriptionFinished: string;
    eventPlaceholderSubscriptionProgress: string;

    async loadValidationViolations() {
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS")) {
            this.setState({ validationViolationsLoading: true });

            try {
                const validationViolationsCountResponse = await ValidationViolationsAPI.getCount({
                    projectId: this.props.projectId
                });

                this.setState({
                    validationViolationsCountResponse: validationViolationsCountResponse
                });
            } catch (error) {
                console.error(error);
                message.error("Failed to load violations count.");
            }

            this.setState({
                validationViolationsLoading: false
            });
        }
    }

    async loadBackgroundJobs() {
        try {
            const getBackgroundJobsResponse = await BackgroundJobsAPI.getBackgroundJobs(this.props.projectId, {
                status: ["CREATED", "RUNNING"],
                jobTypes: ["RECHECK_ALL_VALIDATIONS"]
            });
            this.setState({
                getBackgroundJobsResponse: getBackgroundJobsResponse
            });
        } catch (e) {
            console.error(e);
        }
    }

    onPubSubEvent = (event: PUBSUB_EVENTS, data: { projectId: string }) => {
        if (data.projectId === this.props.projectId) {
            void this.loadBackgroundJobs();

            if (event === PUBSUB_RECHECK_ALL_VALIDATIONS_FINISHED) {
                void this.loadValidationViolations();
                void dashboardStore.reloadCurrentProjectIssuesCount();
                message.success("Checking translations for validation issues completed.");
            }

            if (event === PUBSUB_CHECK_PLACEHOLDERS_FINISHED) {
                void this.loadValidationViolations();
                void dashboardStore.reloadCurrentProjectIssuesCount();
                message.success("Checking translations for placeholder issues completed.");
            }
        }
    };

    async componentDidMount() {
        await Promise.all([this.loadBackgroundJobs(), this.loadValidationViolations()]);

        this.eventValidationSubscriptionFinished = PubSub.subscribe(
            PUBSUB_RECHECK_ALL_VALIDATIONS_FINISHED,
            this.onPubSubEvent
        );
        this.eventValidationSubscriptionProgress = PubSub.subscribe(
            PUBSUB_RECHECK_ALL_VALIDATIONS_PROGRESS,
            this.onPubSubEvent
        );
        this.eventPlaceholderSubscriptionFinished = PubSub.subscribe(
            PUBSUB_CHECK_PLACEHOLDERS_FINISHED,
            this.onPubSubEvent
        );
        this.eventPlaceholderSubscriptionProgress = PubSub.subscribe(
            PUBSUB_CHECK_PLACEHOLDERS_PROGRESS,
            this.onPubSubEvent
        );
    }

    componentWillUnmount() {
        if (this.eventValidationSubscriptionFinished) {
            PubSub.unsubscribe(this.eventValidationSubscriptionFinished);
        }

        if (this.eventValidationSubscriptionProgress) {
            PubSub.unsubscribe(this.eventValidationSubscriptionProgress);
        }

        if (this.eventPlaceholderSubscriptionFinished) {
            PubSub.unsubscribe(this.eventPlaceholderSubscriptionFinished);
        }

        if (this.eventPlaceholderSubscriptionProgress) {
            PubSub.unsubscribe(this.eventPlaceholderSubscriptionProgress);
        }
    }

    isAlreadyRecheckingAllValidations = () => {
        return this.state.getBackgroundJobsResponse?.meta?.total > 0;
    };

    render() {
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                <IssuesTag
                    loading={this.state.validationViolationsLoading}
                    projectId={this.props.projectId}
                    issuesCount={this.state.validationViolationsCountResponse?.total || 0}
                />

                <Link
                    to={Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE.replace(":projectId", this.props.projectId)}
                    style={{ marginLeft: 24, marginRight: 40 }}
                >
                    View issues
                </Link>

                <Popconfirm
                    title="Do you want to check your translations for issues?"
                    disabled={
                        !this.state.getBackgroundJobsResponse || !dashboardStore.featureEnabled("FEATURE_VALIDATIONS")
                    }
                    onConfirm={async () => {
                        this.setState({ checkingValidations: true });

                        try {
                            const thingsToCheck = [];

                            if (this.props.checkFor === "validations" || this.props.checkFor === "all") {
                                thingsToCheck.push(
                                    ValidationsAPI.checkValidations({
                                        linkedType: "project",
                                        linkedId: this.props.projectId
                                    })
                                );
                            }

                            if (this.props.checkFor === "placeholders" || this.props.checkFor === "all") {
                                thingsToCheck.push(
                                    PlaceholdersAPI.checkPlaceholders({
                                        projectId: this.props.projectId
                                    })
                                );
                            }

                            await Promise.all(thingsToCheck);

                            message.success("Successfully queued job to check translations for issues.");
                            await Promise.all([
                                this.loadBackgroundJobs(),
                                dashboardStore.loadBackgroundJobs(this.props.projectId)
                            ]);
                        } catch (error) {
                            console.error(error);
                            message.error("Failed to queue job for checking translations for issues.");
                        }

                        this.setState({ checkingValidations: false });
                    }}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                >
                    <Button
                        type="primary"
                        loading={this.state.checkingValidations || this.isAlreadyRecheckingAllValidations()}
                        style={{ marginLeft: 80 }}
                        disabled={
                            !this.state.getBackgroundJobsResponse ||
                            !dashboardStore.featureEnabled("FEATURE_VALIDATIONS")
                        }
                    >
                        {this.state.checkingValidations || this.isAlreadyRecheckingAllValidations()
                            ? "Checking translations..."
                            : "Check translations for issues"}
                    </Button>
                </Popconfirm>
            </div>
        );
    }
}
