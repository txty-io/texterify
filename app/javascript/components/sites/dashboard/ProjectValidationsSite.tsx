import { Button, Empty, message, Modal, Switch, Table, Tooltip } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import {
    IGetValidationsOptions,
    IGetValidationsResponse,
    IValidation,
    ValidationsAPI
} from "../../api/v1/ValidationsAPI";
import { AddEditValidationForm } from "../../forms/AddEditValidationForm";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { DeleteLink } from "../../ui/DeleteLink";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { ValidationSiteHeader } from "../../ui/ValidationSiteHeader";
import { ValidationsSidebar } from "../../ui/ValidationsSidebar";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addValidationDialogVisible: boolean;
    validationToEdit: IValidation;
    validationsResponse: IGetValidationsResponse;
    validationsLoading: boolean;
    validationUpdating: boolean;

    page: number;
    perPage: number;
}

@observer
class ProjectValidationsSite extends React.Component<IProps, IState> {
    state: IState = {
        addValidationDialogVisible: false,
        validationToEdit: null,
        validationsResponse: null,
        validationsLoading: false,
        validationUpdating: false,

        page: 1,
        perPage: 10
    };

    async componentDidMount() {
        await Promise.all([this.loadValidations()]);
    }

    async loadValidations(options?: { page?: number; perPage?: number }) {
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS")) {
            this.setState({ validationsLoading: true });

            try {
                const validationsResponse = await ValidationsAPI.getValidations({
                    linkedId: this.props.match.params.projectId,
                    linkedType: "project",
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
                        <Tooltip
                            title={
                                validation.attributes.organization_id
                                    ? "Change in your organization validation settings."
                                    : undefined
                            }
                        >
                            <Switch
                                defaultChecked={validation.attributes.enabled}
                                loading={this.state.validationUpdating}
                                checked={validation.attributes.enabled}
                                disabled={!!validation.attributes.organization_id}
                                onChange={async () => {
                                    this.setState({ validationUpdating: true });

                                    try {
                                        await ValidationsAPI.updateValidation({
                                            linkedId: this.props.match.params.projectId,
                                            linkedType: "project",
                                            validationId: validation.id,
                                            enabled: !validation.attributes.enabled
                                        });

                                        message.success(
                                            !validation.attributes.enabled
                                                ? "Validation enabled."
                                                : "Validation disabled."
                                        );

                                        validation.attributes.enabled = !validation.attributes.enabled;
                                    } catch (error) {
                                        console.error(error);
                                        message.error("Failed to update validation status.");
                                    }

                                    this.setState({ validationUpdating: false });
                                }}
                            />
                        </Tooltip>
                    </div>
                ),
                controls: (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {validation.attributes.organization_id ? (
                            <Tooltip title="Click to edit in organization">
                                <Link
                                    to={Routes.DASHBOARD.ORGANIZATION_VALIDATIONS_RESOLVER({
                                        organizationId: validation.attributes.organization_id
                                    })}
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    Inherited
                                </Link>
                            </Tooltip>
                        ) : (
                            <>
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
                                                this.setState({ validationsLoading: true });
                                                try {
                                                    await ValidationsAPI.deleteValidation({
                                                        linkedId: this.props.match.params.projectId,
                                                        linkedType: "project",
                                                        validationId: validation.id
                                                    });
                                                    message.success("Validation deleted");
                                                } catch (error) {
                                                    console.error(error);
                                                    message.error("Failed to delete validation.");
                                                }

                                                this.setState({ page: 1, validationsLoading: false });
                                                await this.loadValidations({ page: 1 });
                                            }
                                        });
                                    }}
                                    style={{ marginLeft: 16 }}
                                >
                                    Delete
                                </DeleteLink>
                            </>
                        )}
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
        const fetchOptions: IGetValidationsOptions = options || {
            linkedId: this.props.match.params.projectId,
            linkedType: "project"
        };
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.loadValidations(fetchOptions);
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
                            <p>Create validation rules to ensure the quality of your translations.</p>

                            {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                <FeatureNotAvailable
                                    feature="FEATURE_VALIDATIONS"
                                    dataId="FEATURE_VALIDATIONS_NOT_AVAILABLE"
                                />
                            )}

                            {dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                <>
                                    <ValidationSiteHeader
                                        projectId={this.props.match.params.projectId}
                                        checkFor="validations"
                                    />

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
                                                    total: this.state.validationsResponse?.meta?.total || 0,
                                                    onChange: async (page: number, perPage: number) => {
                                                        const isPageSizeChange = perPage !== this.state.perPage;

                                                        if (isPageSizeChange) {
                                                            this.setState({ page: 1, perPage: perPage });
                                                            await this.reloadTable({
                                                                page: 1,
                                                                perPage: perPage,
                                                                linkedId: this.props.match.params.projectId,
                                                                linkedType: "project"
                                                            });
                                                        } else {
                                                            this.setState({ page: page, perPage: perPage });
                                                            await this.reloadTable({
                                                                page: page,
                                                                perPage: perPage,
                                                                linkedId: this.props.match.params.projectId,
                                                                linkedType: "project"
                                                            });
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
                            )}
                        </LayoutWithSidebarContentWrapperInner>
                    </LayoutWithSidebarContentWrapper>
                </LayoutWithSidebar>

                <AddEditValidationForm
                    linkedId={this.props.match.params.projectId}
                    linkedType="project"
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

                        const validationsResponse = await ValidationsAPI.getValidations({
                            linkedId: this.props.match.params.projectId,
                            linkedType: "project"
                        });
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
