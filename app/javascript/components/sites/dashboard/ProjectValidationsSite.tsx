import { Button, Layout, message, Modal, Pagination, Skeleton, Switch } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { IGetValidationsResponse, ValidationsAPI } from "../../api/v1/ValidationsAPI";
import { AddEditValidationForm } from "../../forms/AddEditValidationForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";

const DeleteLink = styled.a`
    && {
        color: var(--error-color);
        margin-left: 8px;

        &:hover {
            color: var(--error-color-hover);
        }
    }
`;

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addDialogVisible: boolean;
    validationToEdit: any;
    validationsResponse: IGetValidationsResponse;
    validationsLoading: boolean;
    page: number;
    perPage: number;
}

@observer
class ProjectValidationsSite extends React.Component<IProps, IState> {
    state: IState = {
        addDialogVisible: false,
        validationToEdit: null,
        validationsResponse: null,
        validationsLoading: false,
        page: 1,
        perPage: 10
    };

    async componentDidMount() {
        await this.loadValidations();
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

    renderValidationRule = (props: { name: string; description: string; property: string }) => {
        return (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16, maxWidth: 480, width: "100%" }}>
                <div
                    style={{
                        width: 4,
                        height: 4,
                        background: "#0f0",
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
                            message.success("Validation status changed.");
                        } else if (props.property === "validate_trailing_whitespace") {
                            await ProjectsAPI.updateProject({
                                projectId: this.props.match.params.projectId,
                                validateTrailingWhitespace: !dashboardStore.currentProject.attributes[props.property]
                            });
                            message.success("Validation status changed.");
                        } else if (props.property === "validate_double_whitespace") {
                            await ProjectsAPI.updateProject({
                                projectId: this.props.match.params.projectId,
                                validateDoubleWhitespace: !dashboardStore.currentProject.attributes[props.property]
                            });
                            message.success("Validation status changed.");
                        } else if (props.property === "validate_https") {
                            await ProjectsAPI.updateProject({
                                projectId: this.props.match.params.projectId,
                                validateHTTPS: !dashboardStore.currentProject.attributes[props.property]
                            });
                            message.success("Validation status changed.");
                        } else {
                            message.error("Invalid validation.");
                        }
                    }}
                />
            </div>
        );
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

                        <div style={{ display: "flex" }}>
                            <div
                                style={{
                                    marginRight: 80,
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    maxWidth: 480,
                                    alignItems: "flex-start"
                                }}
                            >
                                <h3>Your validations</h3>
                                <Button
                                    type="default"
                                    style={{ marginBottom: 16 }}
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                >
                                    Create validation rule
                                </Button>

                                {this.state.validationsLoading && (
                                    <div style={{ maxWidth: 480, width: "100%" }}>
                                        <Skeleton active />
                                    </div>
                                )}

                                {!this.state.validationsLoading &&
                                    this.state.validationsResponse?.data.map((validation) => {
                                        return (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginBottom: 16,
                                                    maxWidth: 480,
                                                    width: "100%"
                                                }}
                                                key={validation.id}
                                            >
                                                <div
                                                    style={{
                                                        width: 4,
                                                        height: 4,
                                                        background: validation.attributes.enabled ? "#0f0" : "#f00",
                                                        borderRadius: "100%",
                                                        marginRight: 16,
                                                        flexShrink: 0
                                                    }}
                                                />
                                                <div style={{ marginRight: "auto" }}>
                                                    <div
                                                        style={{
                                                            fontSize: 16,
                                                            fontWeight: "bold",
                                                            wordBreak: "break-word"
                                                        }}
                                                    >
                                                        {validation.attributes.name}
                                                    </div>
                                                    <div
                                                        style={{ fontSize: 14, opacity: 0.75, wordBreak: "break-word" }}
                                                    >
                                                        {validation.attributes.description}
                                                    </div>
                                                    <div
                                                        style={{ fontSize: 14, display: "flex", alignItems: "center" }}
                                                    >
                                                        {validation.attributes.match}
                                                        <span style={{ marginLeft: 8, wordBreak: "break-word" }}>
                                                            {validation.attributes.content}
                                                        </span>
                                                    </div>
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
                                                <Switch
                                                    defaultChecked={validation.attributes.enabled}
                                                    style={{ marginLeft: 24 }}
                                                    onChange={async () => {
                                                        await ValidationsAPI.updateValidation({
                                                            projectId: this.props.match.params.projectId,
                                                            validationId: validation.id,
                                                            enabled: !validation.attributes.enabled
                                                        });

                                                        message.success("Validation status changed.");

                                                        await this.loadValidations();
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}

                                <Pagination
                                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                                    showSizeChanger
                                    pageSize={this.state.perPage}
                                    current={this.state.page}
                                    total={
                                        (this.state.validationsResponse &&
                                            this.state.validationsResponse.meta &&
                                            this.state.validationsResponse.meta.total) ||
                                        0
                                    }
                                    onChange={async (page: number, _perPage: number) => {
                                        this.setState({ page: page });
                                        await this.loadValidations({ page: page });
                                    }}
                                    onShowSizeChange={async (_current: number, size: number) => {
                                        this.setState({ page: 1, perPage: size });
                                        await this.loadValidations({ page: 1, perPage: size });
                                    }}
                                    style={{ marginTop: 24, marginLeft: "auto" }}
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
                            validationToEdit: null
                        });

                        const validationsResponse = await ValidationsAPI.getValidations(
                            this.props.match.params.projectId
                        );
                        this.setState({
                            validationsResponse: validationsResponse
                        });
                    }}
                />
            </>
        );
    }
}

export { ProjectValidationsSite };
