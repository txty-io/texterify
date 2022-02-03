import { Button, Empty, Layout, message, Modal, Popconfirm, Switch, Table } from "antd";
import { TableRowSelection } from "antd/lib/table/interface";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import { BackgroundJobsAPI, IGetBackgroundJobsResponse } from "../../api/v1/BackgroundJobsAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { IGetValidationsOptions, IGetValidationsResponse, ValidationsAPI } from "../../api/v1/ValidationsAPI";
import { IGetValidationViolationsCountResponse, ValidationViolationsAPI } from "../../api/v1/ValidationViolationsAPI";
import { AddEditValidationForm } from "../../forms/AddEditValidationForm";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { IssuesTag } from "../../ui/IssuesTag";
import PubSub from "pubsub-js";
import { RECHECK_ALL_VALIDATIONS_FINISHED } from "../../utilities/Events";
import { Link } from "react-router-dom";

const DeleteLink = styled.a`
    && {
        color: var(--error-color);
        margin-left: 16px;

        &:hover {
            color: var(--error-color-hover);
        }
    }
`;

interface ITableRow {
    key: string;
    name: string;
    description: string;
    validation: React.ReactNode;
    controls: React.ReactNode;
}

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addDialogVisible: boolean;
    validationToEdit: any;
    validationsResponse: IGetValidationsResponse;
    validationsLoading: boolean;
    validationUpdating: boolean;
    page: number;
    perPage: number;
    validationViolationsCountResponse: IGetValidationViolationsCountResponse;
    validationViolationsLoading: boolean;
    selectedRowKeys: any[];
    recheckingValidations: boolean;
    getBackgroundJobsResponse: IGetBackgroundJobsResponse;
}

@observer
class ProjectValidationsSite extends React.Component<IProps, IState> {
    state: IState = {
        addDialogVisible: false,
        validationToEdit: null,
        validationsResponse: null,
        validationsLoading: false,
        validationUpdating: false,
        page: 1,
        perPage: 10,
        validationViolationsCountResponse: null,
        validationViolationsLoading: true,
        selectedRowKeys: [],
        recheckingValidations: false,
        getBackgroundJobsResponse: null
    };

    rowSelection: TableRowSelection<ITableRow> = {
        onChange: (selectedRowKeys, _selectedRows) => {
            this.setState({
                selectedRowKeys: selectedRowKeys
            });
        },
        getCheckboxProps: () => {
            return {
                disabled: false
            };
        }
    };

    eventSubscription: string;

    callback = (_event: string, data: { projectId: string }) => {
        if (data.projectId === this.props.match.params.projectId) {
            void this.loadBackgroundJobs();
            void this.fetchValidationViolations();
            void dashboardStore.reloadCurrentProjectIssuesCount();
            message.success("Rechecking all validations completed.");
        }
    };

    async componentDidMount() {
        await Promise.all([this.fetchValidationViolations(), this.loadValidations(), this.loadBackgroundJobs()]);

        this.eventSubscription = PubSub.subscribe(RECHECK_ALL_VALIDATIONS_FINISHED, this.callback);
    }

    componentWillUnmount() {
        if (this.eventSubscription) {
            PubSub.unsubscribe(this.eventSubscription);
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
        return (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24, maxWidth: 480, width: "100%" }}>
                <div
                    style={{
                        width: 4,
                        height: 4,
                        background: dashboardStore.currentProject.attributes[props.property]
                            ? "var(--color-success)"
                            : "var(--error-color)",
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
                                    addDialogVisible: true,
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
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="projectValidations" />
                    <Layout.Content
                        style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}
                    >
                        <h1>Validations</h1>
                        <p>Create rules to ensure the quality of your translations.</p>

                        <div style={{ display: "flex", alignItems: "center", maxWidth: 1280 }}>
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
                                            "Successfully queued job to check all translations for issues."
                                        );
                                        await Promise.all([
                                            await this.loadBackgroundJobs(),
                                            await dashboardStore.loadBackgroundJobs(this.props.match.params.projectId)
                                        ]);
                                    } catch (error) {
                                        console.error(error);
                                        message.error("Failed to queue job for checking all translations for issues.");
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
                                        this.state.recheckingValidations || this.isAlreadyRecheckingAllValidations()
                                    }
                                    style={{ marginLeft: "auto" }}
                                    disabled={!this.state.getBackgroundJobsResponse}
                                >
                                    {this.state.recheckingValidations || this.isAlreadyRecheckingAllValidations()
                                        ? "Rechecking validations..."
                                        : "Recheck all validations"}
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
                                        this.setState({ addDialogVisible: true });
                                    }}
                                >
                                    Create validation rule
                                </Button>

                                <Table
                                    rowSelection={this.rowSelection}
                                    dataSource={this.getRows()}
                                    columns={this.getColumns()}
                                    style={{ width: "100%" }}
                                    bordered
                                    loading={this.state.validationsLoading}
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
                                    description: "Checks if a translation contains two or more whitespaces in a row.",
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
                    </Layout.Content>
                </Layout>

                <AddEditValidationForm
                    projectId={this.props.match.params.projectId}
                    validationToEdit={this.state.validationToEdit}
                    visible={this.state.addDialogVisible}
                    onCancelRequest={() => {
                        this.setState({
                            addDialogVisible: false,
                            validationToEdit: null
                        });
                    }}
                    onCreated={async () => {
                        this.setState({
                            addDialogVisible: false,
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
