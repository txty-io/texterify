import { Button, Empty, Layout, Modal, Table } from "antd";
import { TableRowSelection } from "antd/lib/table/interface";
import * as _ from "lodash";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { IGetPostProcessingRulesResponse, PostProcessingRulesAPI } from "../../api/v1/PostProcessingRulesAPI";
import { AddEditPostProcessingRuleForm } from "../../forms/AddEditPostProcessingRuleForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { PermissionUtils } from "../../utilities/PermissionUtils";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addDialogVisible: boolean;
    ruleToEdit: any;
    rulesResponse: IGetPostProcessingRulesResponse;
    rulesLoading: boolean;
    search: string;
    page: number;
    perPage: number;
    selectedRowRules: any[];
    isDeleting: boolean;
    deleteDialogVisible: boolean;
}

interface ITableRow {
    key: string;
    name: string;
    searchFor: string;
    replaceWith: string;
    exportConfig: string;
    controls: React.ReactNode;
}

@observer
class ProjectPostProcessingSite extends React.Component<IProps, IState> {
    state: IState = {
        addDialogVisible: false,
        ruleToEdit: null,
        rulesResponse: null,
        rulesLoading: false,
        search: "",
        page: 1,
        perPage: DEFAULT_PAGE_SIZE,
        selectedRowRules: [],
        isDeleting: false,
        deleteDialogVisible: false
    };

    debouncedSearchReloader = _.debounce(
        async (value) => {
            this.setState({ search: value, page: 1 });
            await this.reloadTable({ search: value, page: 1 });
        },
        500,
        { trailing: true }
    );

    rowSelection: TableRowSelection<ITableRow> = {
        onChange: (selectedRowKeys, _selectedRows) => {
            this.setState({
                selectedRowRules: selectedRowKeys
            });
        },
        getCheckboxProps: () => {
            return {
                disabled: !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())
            };
        }
    };

    async componentDidMount() {
        this.reloadTable();
    }

    fetchPostProcessingRules = async (options?: any) => {
        this.setState({ rulesLoading: true });
        try {
            const responseRules = await PostProcessingRulesAPI.getPostProcessingRules(
                this.props.match.params.projectId,
                options
            );

            this.setState({
                rulesResponse: responseRules
            });
        } catch (error) {
            console.error(error);
        }
        this.setState({ rulesLoading: false });
    };

    reloadTable = async (options?: any) => {
        const fetchOptions = options || {};
        fetchOptions.search = (options && options.search) || this.state.search;
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.fetchPostProcessingRules(fetchOptions);
    };

    onEditRuleClick = (rule: any) => {
        this.setState({ addDialogVisible: true, ruleToEdit: rule });
    };

    getColumns = () => {
        return [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Search for",
                dataIndex: "searchFor",
                key: "searchFor"
            },
            {
                title: "Replace with",
                dataIndex: "replaceWith",
                key: "replaceWith"
            },
            {
                title: "Export target",
                dataIndex: "exportConfig",
                key: "exportConfig"
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50
            }
        ];
    };

    getRows = () => {
        if (!this.state.rulesResponse?.data) {
            return [];
        }

        return this.state.rulesResponse.data.map((rule) => {
            const exportConfig = APIUtils.getIncludedObject(
                rule.relationships.export_config.data,
                this.state.rulesResponse.included
            );

            return {
                key: rule.attributes.id,
                name: rule.attributes.name,
                searchFor: rule.attributes.search_for,
                replaceWith: rule.attributes.replace_with,
                exportConfig: exportConfig?.attributes.name,
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Button
                            onClick={() => {
                                this.onEditRuleClick(rule);
                            }}
                            disabled={!dashboardStore.featureEnabled("FEATURE_POST_PROCESSING")}
                        >
                            Edit
                        </Button>
                    </div>
                )
            };
        }, []);
    };

    onDelete = async () => {
        this.setState({
            isDeleting: true,
            deleteDialogVisible: true
        });

        Modal.confirm({
            title: "Do you really want to delete this post processing rules?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: this.state.deleteDialogVisible,
            onOk: async () => {
                try {
                    const response = await PostProcessingRulesAPI.deletePostProcessingRules(
                        this.props.match.params.projectId,
                        this.state.selectedRowRules
                    );

                    if (response.errors) {
                        return;
                    }

                    await this.reloadTable();

                    this.setState({
                        isDeleting: false,
                        deleteDialogVisible: false,
                        selectedRowRules: []
                    });

                    this.rowSelection.selectedRowKeys = [];
                } catch (error) {
                    console.error(error);
                }
            },
            onCancel: () => {
                this.setState({
                    isDeleting: false,
                    deleteDialogVisible: false
                });
            }
        });
    };

    render() {
        this.rowSelection.selectedRowKeys = this.state.selectedRowRules;

        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="projectPostProcessing" />
                    <Layout.Content
                        style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}
                    >
                        <h1>Post Processing</h1>
                        <p style={{ maxWidth: 560 }}>
                            Create modification rules that are applied on your translations at export time. The rules
                            are applied ordered by name as shown in the table below.
                        </p>
                        {!dashboardStore.featureEnabled("FEATURE_POST_PROCESSING") && (
                            <FeatureNotAvailable feature="FEATURE_POST_PROCESSING" />
                        )}
                        <div style={{ display: "flex" }}>
                            <div style={{ flexGrow: 1 }}>
                                <Button
                                    type="default"
                                    style={{ marginRight: 10 }}
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                    disabled={
                                        !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole()) ||
                                        !dashboardStore.featureEnabled("FEATURE_POST_PROCESSING")
                                    }
                                >
                                    Create rule
                                </Button>
                                <Button
                                    danger
                                    onClick={this.onDelete}
                                    disabled={
                                        this.state.selectedRowRules.length === 0 ||
                                        !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())
                                    }
                                    loading={this.state.isDeleting}
                                >
                                    Delete selected
                                </Button>
                            </div>
                        </div>
                        <Table
                            rowSelection={this.rowSelection}
                            dataSource={this.getRows()}
                            columns={this.getColumns()}
                            style={{ marginTop: 16 }}
                            bordered
                            loading={
                                this.state.rulesLoading ||
                                dashboardStore.currentProject.attributes.current_user_deactivated
                            }
                            pagination={{
                                pageSizeOptions: PAGE_SIZE_OPTIONS,
                                showSizeChanger: true,
                                pageSize: this.state.perPage,
                                total: this.state.rulesResponse?.meta?.total || 0,
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
                                        description="No post processing rules found"
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    />
                                )
                            }}
                        />
                    </Layout.Content>
                </Layout>

                <AddEditPostProcessingRuleForm
                    projectId={this.props.match.params.projectId}
                    ruleToEdit={this.state.ruleToEdit}
                    visible={this.state.addDialogVisible}
                    onCancelRequest={() => {
                        this.setState({
                            addDialogVisible: false,
                            ruleToEdit: null
                        });
                    }}
                    onCreated={async () => {
                        this.setState({
                            addDialogVisible: false,
                            ruleToEdit: null
                        });

                        const responseRules = await PostProcessingRulesAPI.getPostProcessingRules(
                            this.props.match.params.projectId
                        );
                        this.setState({
                            rulesResponse: responseRules
                        });
                    }}
                />
            </>
        );
    }
}

export { ProjectPostProcessingSite };
