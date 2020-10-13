import { Button, Empty, Layout, Table } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { IGetReleasesOptions, IGetReleasesResponse, ReleasesAPI } from "../../api/v1/ReleasesAPI";
import { AddReleaseForm } from "../../forms/AddReleaseForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import * as _ from "lodash";
import { TableRowSelection } from "antd/lib/table/interface";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addDialogVisible: boolean;
    releasesResponse: IGetReleasesResponse;
    releasesLoading: boolean;
    search: string;
    page: number;
    perPage: number;
    selectedReleases: any[];
}

interface ITableRow {
    key: string;
    fromVersion: string;
    toVersion: string;
    url: JSX.Element;
    exportConfigName: string;
}

@observer
class ProjectOTASite extends React.Component<IProps, IState> {
    state: IState = {
        addDialogVisible: false,
        releasesResponse: null,
        releasesLoading: false,
        search: "",
        page: 1,
        perPage: DEFAULT_PAGE_SIZE,
        selectedReleases: []
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
                selectedReleases: selectedRowKeys
            });
        },
        getCheckboxProps: () => {
            return {
                disabled: !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())
            };
        }
    };

    async componentDidMount() {
        await this.reloadTable();
    }

    async reloadTable(options?: IGetReleasesOptions) {
        this.setState({ releasesLoading: true });
        try {
            const releaseResponse = await ReleasesAPI.getReleases({
                projectId: this.props.match.params.projectId,
                search: options?.search,
                page: options?.page,
                perPage: options?.perPage
            });
            this.setState({ releasesResponse: releaseResponse });
        } catch (error) {
            console.error(error);
        }

        this.setState({ releasesLoading: false });
    }

    getColumns = () => {
        return [
            {
                title: "Export Config",
                dataIndex: "exportConfigName",
                key: "exportConfigName"
            },
            {
                title: "Version",
                dataIndex: "toVersion",
                key: "toVersion"
            },
            {
                title: "URL",
                dataIndex: "url",
                key: "url",
                width: 400
            }
        ];
    };

    getRows = () => {
        if (!this.state.releasesResponse?.data) {
            return [];
        }

        return this.state.releasesResponse.data.map((release) => {
            const exportConfig = APIUtils.getIncludedObject(
                release.relationships.export_config.data,
                this.state.releasesResponse.included
            );

            return {
                key: release.attributes.id,
                fromVersion: release.attributes.from_version,
                toVersion: release.attributes.to_version,
                url: (
                    <div style={{ whiteSpace: "nowrap", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis" }}>
                        <a href={release.attributes.url} rel="noopener noreferrer" target="_blank">
                            {release.attributes.url}
                        </a>
                    </div>
                ),
                exportConfigName: exportConfig?.attributes.name
            };
        }, []);
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="projectOTA" />
                    <Layout.Content
                        style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}
                    >
                        <h1>Over the Air Translations</h1>
                        <p>
                            Update the translations of your mobile app without publishing new app versions on the app
                            store.
                        </p>

                        <div style={{ display: "flex" }}>
                            <div style={{ flexGrow: 1 }}>
                                <Button
                                    type="default"
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                    disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                                >
                                    Create release
                                </Button>
                            </div>
                        </div>

                        <Table
                            rowSelection={this.rowSelection}
                            dataSource={this.getRows()}
                            columns={this.getColumns()}
                            style={{ marginTop: 16 }}
                            bordered
                            loading={this.state.releasesLoading}
                            size="middle"
                            pagination={{
                                pageSizeOptions: PAGE_SIZE_OPTIONS,
                                showSizeChanger: true,
                                pageSize: this.state.perPage,
                                total: this.state.releasesResponse?.meta?.total || 0,
                                onChange: async (page: number, _perPage: number) => {
                                    this.setState({ page: page });
                                    await this.reloadTable({ page: page });
                                },
                                onShowSizeChange: async (_current: number, size: number) => {
                                    this.setState({ page: 1, perPage: size });
                                    await this.reloadTable({ page: 1, perPage: size });
                                }
                            }}
                            locale={{
                                emptyText: (
                                    <Empty description="No releases found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )
                            }}
                        />
                    </Layout.Content>
                </Layout>

                <AddReleaseForm
                    projectId={this.props.match.params.projectId}
                    visible={this.state.addDialogVisible}
                    onCancelRequest={() => {
                        this.setState({
                            addDialogVisible: false
                        });
                    }}
                    onCreated={async () => {
                        this.setState({
                            addDialogVisible: false
                        });

                        await this.reloadTable();
                    }}
                />
            </>
        );
    }
}

export { ProjectOTASite };
