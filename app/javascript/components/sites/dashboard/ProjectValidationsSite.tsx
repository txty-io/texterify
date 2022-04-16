import { Button, Empty, Layout, message, Modal, Popconfirm, Switch, Table } from "antd";
import { TableRowSelection } from "antd/lib/table/interface";
import { observer } from "mobx-react";
import PubSub from "pubsub-js";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { BackgroundJobsAPI, IGetBackgroundJobsResponse } from "../../api/v1/BackgroundJobsAPI";
import {
    ForbiddenWordsListsAPI,
    IForbiddenWordsList,
    IGetForbiddenWordsListsResponse
} from "../../api/v1/ForbiddenWordsListsAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import {
    IGetValidationsOptions,
    IGetValidationsResponse,
    IValidation,
    ValidationsAPI
} from "../../api/v1/ValidationsAPI";
import { IGetValidationViolationsCountResponse, ValidationViolationsAPI } from "../../api/v1/ValidationViolationsAPI";
import { AddEditForbiddenWordsListForm } from "../../forms/AddEditForbiddenWordListForm";
import { AddEditValidationForm } from "../../forms/AddEditValidationForm";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { DeleteLink } from "../../ui/DeleteLink";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { ForbiddenWordsListsTable } from "../../ui/ForbiddenWordsListsTable";
import { IssuesTag } from "../../ui/IssuesTag";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { ValidationsSidebar } from "../../ui/ValidationsSidebar";
import {
    PUBSUB_EVENTS,
    PUBSUB_RECHECK_ALL_VALIDATIONS_FINISHED,
    PUBSUB_RECHECK_ALL_VALIDATIONS_PROGRESS
} from "../../utilities/PubSubEvents";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    // validations
    addValidationDialogVisible: boolean;
    validationToEdit: IValidation;
    validationsResponse: IGetValidationsResponse;
    validationsLoading: boolean;
    validationUpdating: boolean;
    // validation violations
    validationViolationsCountResponse: IGetValidationViolationsCountResponse;
    validationViolationsLoading: boolean;

    page: number;
    perPage: number;
    recheckingValidations: boolean;
    getBackgroundJobsResponse: IGetBackgroundJobsResponse;
}

@observer
class ProjectValidationsSite extends React.Component<IProps, IState> {
    state: IState = {
        // validations
        addValidationDialogVisible: false,
        validationToEdit: null,
        validationsResponse: null,
        validationsLoading: false,
        validationUpdating: false,
        // validation violations
        validationViolationsCountResponse: null,
        validationViolationsLoading: true,

        page: 1,
        perPage: 10,
        recheckingValidations: false,
        getBackgroundJobsResponse: null
    };

    eventSubscriptionFinished: string;
    eventSubscriptionProgress: string;

    onPubSubEvent = (event: PUBSUB_EVENTS, data: { projectId: string }) => {
        if (data.projectId === this.props.match.params.projectId) {
            void this.loadBackgroundJobs();

            if (event === PUBSUB_RECHECK_ALL_VALIDATIONS_FINISHED) {
                void this.fetchValidationViolations();
                void dashboardStore.reloadCurrentProjectIssuesCount();
                message.success("Checking translations for validation issues completed.");
            }
        }
    };

    async componentDidMount() {
        await Promise.all([this.fetchValidationViolations(), this.loadValidations(), this.loadBackgroundJobs()]);

        this.eventSubscriptionFinished = PubSub.subscribe(PUBSUB_RECHECK_ALL_VALIDATIONS_FINISHED, this.onPubSubEvent);
        this.eventSubscriptionProgress = PubSub.subscribe(PUBSUB_RECHECK_ALL_VALIDATIONS_PROGRESS, this.onPubSubEvent);
    }

    componentWillUnmount() {
        if (this.eventSubscriptionFinished) {
            PubSub.unsubscribe(this.eventSubscriptionFinished);
        }

        if (this.eventSubscriptionProgress) {
            PubSub.unsubscribe(this.eventSubscriptionProgress);
        }
    }

    async loadBackgroundJobs() {
        try {
            const getBackgroundJobsResponse = await BackgroundJobsAPI.getBackgroundJobs(
                this.props.match.params.projectId,
                {
                    status: ["CREATED", "RUNNING"],
                    jobTypes: ["RECHECK_ALL_VALIDATIONS"]
                }
            );
            this.setState({
                getBackgroundJobsResponse: getBackgroundJobsResponse
            });
        } catch (e) {
            console.error(e);
        }
    }

    async loadValidations(options?: { page?: number; perPage?: number }) {
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS")) {
            this.setState({ validationsLoading: true });

            try {
                const validationsResponse = await ValidationsAPI.getValidations(this.props.match.params.projectId, {
                    page: options?.page,
                    perPage: options?.perPage
                });

                this.setState({
                    validationsResponse: validationsResponse
                });
            } catch (error) {
                console.error(error);
            }

            this.setState({ validationsLoading: false });
        }
    }

    async fetchValidationViolations() {
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS")) {
            this.setState({ validationViolationsLoading: true });

            try {
                const validationViolationsCountResponse = await ValidationViolationsAPI.getCount({
                    projectId: this.props.match.params.projectId
                });

                this.setState({
                    validationViolationsCountResponse: validationViolationsCountResponse
                });
            } catch (error) {
                console.error(error);
                message.error("Failed to load violations.");
            }

            this.setState({
                validationViolationsLoading: false
            });
        }
    }

    renderValidationRule = (props: { name: string; description: string; property: string }) => {
        let dotColor = dashboardStore.currentProject.attributes[props.property]
            ? "var(--color-success)"
            : "var(--error-color)";
        if (!dashboardStore.featureEnabled("FEATURE_VALIDATIONS")) {
            dotColor = "var(--border-color)";
        }

        return (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24, maxWidth: 480, width: "100%" }}>
                <div
                    style={{
                        width: 4,
                        height: 4,
                        background: dotColor,
                        borderRadius: "100%",
                        marginRight: 16,
                        flexShrink: 0
                    }}
                />
                <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <div style={{ fontWeight: "bold" }}>{props.name}</div>
                    <div style={{ opacity: 0.75 }}>{props.description}</div>
                </div>
                <Switch
                    defaultChecked={dashboardStore.currentProject.attributes[props.property]}
                    style={{ marginLeft: 24 }}
                    disabled={!dashboardStore.featureEnabled("FEATURE_VALIDATIONS")}
                    onChange={async () => {
                        if (props.property === "validate_leading_whitespace") {
                            await ProjectsAPI.updateProject({
                                projectId: this.props.match.params.projectId,
                                validateLeadingWhitespace: !dashboardStore.currentProject.attributes[props.property]
                            });
                        } else if (props.property === "validate_trailing_whitespace") {
                            await ProjectsAPI.updateProject({
                                projectId: this.props.match.params.projectId,
                                validateTrailingWhitespace: !dashboardStore.currentProject.attributes[props.property]
                            });
                        } else if (props.property === "validate_double_whitespace") {
                            await ProjectsAPI.updateProject({
                                projectId: this.props.match.params.projectId,
                                validateDoubleWhitespace: !dashboardStore.currentProject.attributes[props.property]
                            });
                        } else if (props.property === "validate_https") {
                            await ProjectsAPI.updateProject({
                                projectId: this.props.match.params.projectId,
                                validateHTTPS: !dashboardStore.currentProject.attributes[props.property]
                            });
                        } else {
                            message.error("Invalid validation.");
                            return;
                        }

                        message.success(
                            !dashboardStore.currentProject.attributes[props.property]
                                ? "Validation enabled."
                                : "Validation disabled."
                        );
                        dashboardStore.currentProject.attributes[props.property] =
                            !dashboardStore.currentProject.attributes[props.property];
                    }}
                />
            </div>
        );
    };

    getRows = () => {
        if (!this.state.validationsResponse || !this.state.validationsResponse.data) {
            return [];
        }

        return this.state.validationsResponse.data.map((validation) => {
            return {
                key: validation.attributes.id,
                name: validation.attributes.name,
                description: validation.attributes.description,
                validation: (
                    <>
                        <b>{validation.attributes.match}</b> {validation.attributes.content}
                    </>
                ),
                enabled: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Switch
                            defaultChecked={validation.attributes.enabled}
                            loading={this.state.validationUpdating}
                            checked={validation.attributes.enabled}
                            onChange={async () => {
                                this.setState({ validationUpdating: true });

                                try {
                                    await ValidationsAPI.updateValidation({
                                        projectId: this.props.match.params.projectId,
                                        validationId: validation.id,
                                        enabled: !validation.attributes.enabled
                                    });

                                    message.success(
                                        !validation.attributes.enabled ? "Validation enabled." : "Validation disabled."
                                    );

                                    validation.attributes.enabled = !validation.attributes.enabled;
                                } catch (error) {
                                    console.error(error);
                                    message.error("Failed to update validation status.");
                                }

                                this.setState({ validationUpdating: false });
                            }}
                        />
                    </div>
                ),
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <a
                            onClick={() => {
                                this.setState({
                                    addValidationDialogVisible: true,
                                    validationToEdit: validation
                                });
                            }}
                        >
                            Edit
                        </a>
                        <DeleteLink
                            onClick={() => {
                                Modal.confirm({
                                    title: "Do you really want to delete this validation?",
                                    content: "This cannot be undone.",
                                    okText: "Yes",
                                    okButtonProps: {
                                        danger: true
                                    },
                                    cancelText: "No",
                                    autoFocusButton: "cancel",
                                    onOk: async () => {
                                        await ValidationsAPI.deleteValidation(
                                            this.props.match.params.projectId,
                                            validation.id
                                        );

                                        await this.loadValidations();
                                        message.success("Validation deleted");
                                    }
                                });
                            }}
                            style={{ marginLeft: 16 }}
                        >
                            Delete
                        </DeleteLink>
                    </div>
                )
            };
        }, []);
    };

    getColumns = () => {
        const columns: any[] = [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Description",
                dataIndex: "description",
                key: "description"
            },
            {
                title: "Report if",
                dataIndex: "validation",
                key: "validation"
            },
            {
                title: "Enabled",
                dataIndex: "enabled",
                width: 50
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50
            }
        ];

        return columns;
    };

    reloadTable = async (options?: IGetValidationsOptions) => {
        const fetchOptions = options || {};
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.loadValidations(fetchOptions);
    };

    isAlreadyRecheckingAllValidations = () => {
        return this.state.getBackgroundJobsResponse?.meta?.total > 0;
    };

    render() {
        return (
            <>
                <LayoutWithSidebar>
                    <ValidationsSidebar projectId={this.props.match.params.projectId} />

                    <LayoutWithSidebarContentWrapper>
                        <Breadcrumbs breadcrumbName="projectValidations" />
                        <LayoutWithSidebarContentWrapperInner>
                            <h1>Validations</h1>
                            <p>Create rules to ensure the quality of your translations.</p>

                            {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                <FeatureNotAvailable
                                    feature="FEATURE_VALIDATIONS"
                                    dataId="FEATURE_VALIDATIONS_NOT_AVAILABLE"
                                    style={{ marginBottom: 24 }}
                                />
                            )}

                            {/* {dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && ( */}
                            <>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <IssuesTag
                                        loading={this.state.validationViolationsLoading}
                                        projectId={this.props.match.params.projectId}
                                        issuesCount={this.state.validationViolationsCountResponse?.total || 0}
                                    />

                                    <Link
                                        to={Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE.replace(
                                            ":projectId",
                                            this.props.match.params.projectId
                                        )}
                                        style={{ marginLeft: 24, marginRight: 40, lineHeight: 0 }}
                                    >
                                        View issues
                                    </Link>

                                    <Popconfirm
                                        title="Do you want to run all enabled validations against your translations?"
                                        onConfirm={async () => {
                                            this.setState({ recheckingValidations: true });
                                            try {
                                                await ValidationsAPI.recheckValidations({
                                                    projectId: this.props.match.params.projectId
                                                });
                                                message.success(
                                                    "Successfully queued job to check translations for validation issues."
                                                );
                                                await Promise.all([
                                                    await this.loadBackgroundJobs(),
                                                    await dashboardStore.loadBackgroundJobs(
                                                        this.props.match.params.projectId
                                                    )
                                                ]);
                                            } catch (error) {
                                                console.error(error);
                                                message.error(
                                                    "Failed to queue job for checking translations for validation issues."
                                                );
                                            }

                                            this.setState({ recheckingValidations: false });
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            type="primary"
                                            loading={
                                                this.state.recheckingValidations ||
                                                this.isAlreadyRecheckingAllValidations()
                                            }
                                            style={{ marginLeft: 80 }}
                                            disabled={
                                                !this.state.getBackgroundJobsResponse ||
                                                !dashboardStore.featureEnabled("FEATURE_VALIDATIONS")
                                            }
                                        >
                                            {this.state.recheckingValidations ||
                                            this.isAlreadyRecheckingAllValidations()
                                                ? "Checking translations..."
                                                : "Check translations for validation issues"}
                                        </Button>
                                    </Popconfirm>
                                </div>

                                <div style={{ display: "flex", marginTop: 24 }}>
                                    <div
                                        style={{
                                            marginRight: 80,
                                            display: "flex",
                                            flexDirection: "column",
                                            width: "100%",
                                            maxWidth: 720,
                                            alignItems: "flex-start"
                                        }}
                                    >
                                        <h3>Validation rules</h3>
                                        <Button
                                            type="default"
                                            style={{ marginBottom: 16 }}
                                            onClick={() => {
                                                this.setState({ addValidationDialogVisible: true });
                                            }}
                                            disabled={!dashboardStore.featureEnabled("FEATURE_VALIDATIONS")}
                                        >
                                            Create validation rule
                                        </Button>

                                        <Table
                                            dataSource={this.getRows()}
                                            columns={this.getColumns()}
                                            style={{ width: "100%" }}
                                            bordered
                                            loading={
                                                !dashboardStore.featureEnabled("FEATURE_VALIDATIONS") ||
                                                this.state.validationsLoading
                                            }
                                            pagination={{
                                                pageSizeOptions: PAGE_SIZE_OPTIONS,
                                                showSizeChanger: true,
                                                current: this.state.page,
                                                pageSize: this.state.perPage,
                                                total:
                                                    (this.state.validationsResponse &&
                                                        this.state.validationsResponse.meta.total) ||
                                                    0,
                                                onChange: async (page: number, perPage: number) => {
                                                    const isPageSizeChange = perPage !== this.state.perPage;

                                                    if (isPageSizeChange) {
                                                        this.setState({ page: 1, perPage: perPage });
                                                        await this.reloadTable({ page: 1, perPage: perPage });
                                                    } else {
                                                        this.setState({ page: page, perPage: perPage });
                                                        await this.reloadTable({ page: page, perPage: perPage });
                                                    }
                                                }
                                            }}
                                            locale={{
                                                emptyText: (
                                                    <Empty
                                                        description="No validation rules found"
                                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                    />
                                                )
                                            }}
                                        />
                                    </div>
                                    <div
                                        style={{
                                            marginRight: 80,
                                            display: "flex",
                                            flexDirection: "column",
                                            width: "100%",
                                            maxWidth: 720,
                                            alignItems: "flex-start"
                                        }}
                                    >
                                        <ForbiddenWordsListsTable projectId={this.props.match.params.projectId} />
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            width: "100%",
                                            maxWidth: 480,
                                            alignItems: "flex-start"
                                        }}
                                    >
                                        <h3 style={{ marginBottom: 16 }}>Default validations</h3>
                                        {this.renderValidationRule({
                                            name: "Leading whitespace",
                                            description: "Checks if a translation starts with a whitespace.",
                                            property: "validate_leading_whitespace"
                                        })}

                                        {this.renderValidationRule({
                                            name: "Trailing whitespace",
                                            description: "Checks if a translation ends with a whitespace.",
                                            property: "validate_trailing_whitespace"
                                        })}

                                        {this.renderValidationRule({
                                            name: "Double whitespace",
                                            description:
                                                "Checks if a translation contains two or more whitespaces in a row.",
                                            property: "validate_double_whitespace"
                                        })}

                                        {this.renderValidationRule({
                                            name: "Insecure HTTP URL",
                                            description:
                                                "Checks if insecure HTTP URLs (http://) are used inside the translations. The secure protocol HTTPS (https://) should be used instead.",
                                            property: "validate_https"
                                        })}
                                    </div>
                                </div>
                            </>
                            {/* )} */}
                        </LayoutWithSidebarContentWrapperInner>
                    </LayoutWithSidebarContentWrapper>
                </LayoutWithSidebar>

                <AddEditValidationForm
                    projectId={this.props.match.params.projectId}
                    validationToEdit={this.state.validationToEdit}
                    visible={this.state.addValidationDialogVisible}
                    onCancelRequest={() => {
                        this.setState({
                            addValidationDialogVisible: false,
                            validationToEdit: null
                        });
                    }}
                    onCreated={async () => {
                        this.setState({
                            addValidationDialogVisible: false,
                            validationToEdit: null,
                            validationsLoading: true
                        });

                        const validationsResponse = await ValidationsAPI.getValidations(
                            this.props.match.params.projectId
                        );
                        this.setState({
                            validationsResponse: validationsResponse,
                            validationsLoading: false
                        });
                    }}
                />
            </>
        );
    }
}

export { ProjectValidationsSite };
