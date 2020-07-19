import { Layout, Button, Table, Empty } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PostProcessingRulesAPI } from "../../api/v1/PostProcessingRulesAPI";
import { AddEditPostProcessingRuleForm } from "../../forms/AddEditPostProcessingRuleForm";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import * as _ from "lodash";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import { dashboardStore } from "../../stores/DashboardStore";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addDialogVisible: boolean;
    ruleToEdit: any;
    rulesResponse: any;
    rulesLoading: boolean;
    search: string;
    page: number;
    perPage: number;
    selectedRowRules: any[];
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
        selectedRowRules: []
    };

    debouncedSearchReloader = _.debounce(
        async (value) => {
            this.setState({ search: value, page: 1 });
            await this.reloadTable({ search: value, page: 1 });
        },
        500,
        { trailing: true }
    );

    rowSelection = {
        onChange: (selectedRowRules, _selectedRows) => {
            this.setState({
                selectedRowRules: selectedRowRules
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
            }
        ];
    };

    getRows = () => {
        if (!this.state.rulesResponse || !this.state.rulesResponse.rules) {
            return [];
        }

        return this.state.rulesResponse.rules.map((rule: any) => {
            return {
                name: rule.attributes.name,
                searchFor: rule.attributes.searchFor,
                replaceWith: rule.attributes.replaceWith,
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Button
                            onClick={() => {
                                this.onEditRuleClick(rule);
                            }}
                        >
                            Edit
                        </Button>
                    </div>
                )
            };
        }, []);
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="projectPostProcessing" />
                    <Layout.Content
                        style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}
                    >
                        <h1>Post processing</h1>
                        <p>Create modification rules that are applied on your translations at export time.</p>
                        <div style={{ display: "flex" }}>
                            <div style={{ flexGrow: 1 }}>
                                <Button
                                    type="default"
                                    style={{ marginRight: 10 }}
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                    disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                                >
                                    Create rule
                                </Button>
                            </div>
                        </div>
                        <Table
                            rowSelection={this.rowSelection}
                            dataSource={this.getRows()}
                            columns={this.getColumns()}
                            style={{ marginTop: 16 }}
                            bordered
                            loading={this.state.rulesLoading}
                            size="middle"
                            pagination={{
                                pageSizeOptions: PAGE_SIZE_OPTIONS,
                                showSizeChanger: true,
                                pageSize: this.state.perPage,
                                total: this.state.rulesResponse?.meta?.total || 0,
                                onChange: async (page: number, _perPage: number) => {
                                    this.setState({ page: page });
                                    await this.reloadTable({ page: page });
                                },
                                onShowSizeChange: async (_current: number, size: number) => {
                                    this.setState({ perPage: size });
                                    await this.reloadTable({ perPage: size });
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
