import { Button, Empty, message, Modal, Switch, Table } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import {
    IGetValidationsOptions,
    IGetValidationsResponse,
    IValidation,
    ValidationsAPI
} from "../../api/v1/ValidationsAPI";
import { AddEditValidationForm } from "../../forms/AddEditValidationForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { DeleteLink } from "../../ui/DeleteLink";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { OrganizationQASidebar } from "../../ui/OrganizationQASidebar";

type IProps = RouteComponentProps<{ organizationId: string }>;
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
class OrganizationValidationsSite extends React.Component<IProps, IState> {
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
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS", "organization")) {
            this.setState({ validationsLoading: true });

            try {
                const validationsResponse = await ValidationsAPI.getValidations({
                    linkedId: this.props.match.params.organizationId,
                    linkedType: "organization",
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
                                        linkedId: this.props.match.params.organizationId,
                                        linkedType: "organization",
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
                                        this.setState({ validationsLoading: true });
                                        try {
                                            await ValidationsAPI.deleteValidation({
                                                linkedId: this.props.match.params.organizationId,
                                                linkedType: "organization",
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
        const fetchOptions = options || {
            linkedId: this.props.match.params.organizationId,
            linkedType: "organization"
        };
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.loadValidations(fetchOptions);
    };

    render() {
        return (
            <>
                <LayoutWithSidebar>
                    <OrganizationQASidebar organizationId={this.props.match.params.organizationId} />

                    <LayoutWithSidebarContentWrapper>
                        <Breadcrumbs breadcrumbName="organizationValidations" />
                        <LayoutWithSidebarContentWrapperInner>
                            <h1>Validations</h1>
                            <p>
                                Create validation rules to ensure the quality of your translations. Validation rules
                                that you add here are applied to all your projects.
                            </p>

                            {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS", "organization") && (
                                <FeatureNotAvailable
                                    feature="FEATURE_VALIDATIONS"
                                    dataId="FEATURE_VALIDATIONS_NOT_AVAILABLE"
                                    style={{ marginBottom: 24 }}
                                />
                            )}

                            {dashboardStore.featureEnabled("FEATURE_VALIDATIONS", "organization") && (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "100%",
                                        alignItems: "flex-start"
                                    }}
                                >
                                    <Button
                                        type="default"
                                        style={{ marginBottom: 16 }}
                                        onClick={() => {
                                            this.setState({ addValidationDialogVisible: true });
                                        }}
                                        disabled={!dashboardStore.featureEnabled("FEATURE_VALIDATIONS", "organization")}
                                    >
                                        Create validation rule
                                    </Button>

                                    <Table
                                        dataSource={this.getRows()}
                                        columns={this.getColumns()}
                                        style={{ width: "100%" }}
                                        bordered
                                        loading={
                                            !dashboardStore.featureEnabled("FEATURE_VALIDATIONS", "organization") ||
                                            this.state.validationsLoading
                                        }
                                        pagination={{
                                            pageSizeOptions: PAGE_SIZE_OPTIONS,
                                            showSizeChanger: true,
                                            current: undefined,
                                            pageSize: this.state.perPage,
                                            total: this.state.validationsResponse?.meta?.total || 0,
                                            onChange: async (page: number, perPage: number) => {
                                                const isPageSizeChange = perPage !== this.state.perPage;

                                                if (isPageSizeChange) {
                                                    this.setState({ page: 1, perPage: perPage });
                                                    await this.reloadTable({
                                                        page: 1,
                                                        perPage: perPage,
                                                        linkedId: this.props.match.params.organizationId,
                                                        linkedType: "organization"
                                                    });
                                                } else {
                                                    this.setState({ page: page, perPage: perPage });
                                                    await this.reloadTable({
                                                        page: page,
                                                        perPage: perPage,
                                                        linkedId: this.props.match.params.organizationId,
                                                        linkedType: "organization"
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
                            )}
                        </LayoutWithSidebarContentWrapperInner>
                    </LayoutWithSidebarContentWrapper>
                </LayoutWithSidebar>

                <AddEditValidationForm
                    linkedId={this.props.match.params.organizationId}
                    linkedType="organization"
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
                            linkedId: this.props.match.params.organizationId,
                            linkedType: "organization"
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

export { OrganizationValidationsSite };
