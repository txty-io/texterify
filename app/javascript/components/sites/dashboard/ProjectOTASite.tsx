import { Button, Empty, Layout, Modal, Table } from "antd";
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
import FlagIcon from "../../ui/FlagIcons";
import * as moment from "moment";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    addDialogVisible: boolean;
    releasesResponse: IGetReleasesResponse;
    releasesLoading: boolean;
    isDeleting: boolean;
    deleteDialogVisible: boolean;
    search: string;
    page: number;
    perPage: number;
    selectedReleases: any[];
}

interface ITableRow {
    key: string;
    version: string;
    urls: JSX.Element;
    exportConfigName: string;
}

@observer
class ProjectOTASite extends React.Component<IProps, IState> {
    state: IState = {
        addDialogVisible: false,
        releasesResponse: null,
        releasesLoading: false,
        isDeleting: false,
        deleteDialogVisible: false,
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
                disabled: !PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())
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
                title: "Export configuration",
                dataIndex: "exportConfigName",
                key: "exportConfigName"
            },
            {
                title: "Version",
                dataIndex: "version",
                key: "version"
            },
            {
                title: "Release time",
                dataIndex: "date",
                key: "date"
            },
            {
                title: "File previews",
                dataIndex: "urls",
                key: "urls",
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
                exportConfigName: exportConfig?.attributes.name,
                date: moment(release.attributes.timestamp).format("YYYY-MM-DD HH:mm"),
                version: release.attributes.version,
                urls: (
                    <div
                        style={{
                            maxWidth: 400
                        }}
                    >
                        {release.relationships.release_files.data
                            .sort((a, b) => {
                                const releaseFileA = APIUtils.getIncludedObject(
                                    a,
                                    this.state.releasesResponse.included
                                );

                                const releaseFileB = APIUtils.getIncludedObject(
                                    b,
                                    this.state.releasesResponse.included
                                );

                                return releaseFileA.attributes.language_code > releaseFileB.attributes.language_code
                                    ? 1
                                    : -1;
                            })
                            .map((releaseFileIncluded) => {
                                const releaseFile = APIUtils.getIncludedObject(
                                    releaseFileIncluded,
                                    this.state.releasesResponse.included
                                );

                                return (
                                    <a
                                        href={releaseFile.attributes.preview_url}
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        style={{ whiteSpace: "nowrap", marginRight: 16 }}
                                        key={releaseFile.attributes.id}
                                    >
                                        {releaseFile.attributes.country_code ? (
                                            <>
                                                <FlagIcon code={releaseFile.attributes.country_code.toLowerCase()} />
                                                <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
                                                    {releaseFile.attributes.language_code}-
                                                    {releaseFile.attributes.country_code}
                                                </span>
                                            </>
                                        ) : (
                                            releaseFile.attributes.language_code
                                        )}
                                    </a>
                                );
                            })}
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
            title: "Do you really want to delete the releases?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: this.state.deleteDialogVisible,
            onOk: async () => {
                const response = await ReleasesAPI.deleteReleases(
                    this.props.match.params.projectId,
                    this.state.selectedReleases
                );
                if (response.errors) {
                    return;
                }

                await this.reloadTable();

                this.setState({
                    isDeleting: false,
                    deleteDialogVisible: false,
                    selectedReleases: []
                });

                this.rowSelection.selectedRowKeys = [];
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
        this.rowSelection.selectedRowKeys = this.state.selectedReleases;

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

                        {!dashboardStore.featureEnabled("FEATURE_OTA") && <FeatureNotAvailable feature="FEATURE_OTA" />}

                        <div style={{ display: "flex", flexShrink: 0 }}>
                            <div style={{ flexGrow: 1 }}>
                                <Button
                                    type="default"
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                    style={{ marginRight: 8 }}
                                    disabled={
                                        !PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole()) ||
                                        !dashboardStore.featureEnabled("FEATURE_OTA")
                                    }
                                >
                                    Create release
                                </Button>

                                <Button
                                    danger
                                    onClick={this.onDelete}
                                    disabled={
                                        this.state.selectedReleases.length === 0 ||
                                        !PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())
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
                                this.state.releasesLoading ||
                                dashboardStore.currentProject.attributes.current_user_deactivated
                            }
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
