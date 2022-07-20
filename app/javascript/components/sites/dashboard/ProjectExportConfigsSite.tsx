import { Button, Empty, Modal, Skeleton } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { AddEditExportConfigForm } from "../../forms/AddEditExportConfigForm";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { ProjectExportConfig } from "../../ui/ProjectExportConfig";
import { TexterifyModal } from "../../ui/TexterifyModal";
import { ExportSidebar } from "./ExportSidebar";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    projectExportConfigsLoading: boolean;
    projectExportConfigsResponse: any;
    languagesResponse: any;
    exportConfigToEdit: any;
    addEditExportConfigOpen: boolean;
    isDeleting: boolean;
}

@observer
class ProjectExportConfigsSite extends React.Component<IProps, IState> {
    state: IState = {
        projectExportConfigsLoading: true,
        projectExportConfigsResponse: null,
        languagesResponse: null,
        exportConfigToEdit: null,
        addEditExportConfigOpen: false,
        isDeleting: false
    };

    async componentDidMount() {
        await this.fetchData();
    }

    fetchData = async () => {
        this.setState({ projectExportConfigsLoading: true });

        try {
            const projectExportConfigsResponse = await ExportConfigsAPI.getExportConfigs({
                projectId: this.props.match.params.projectId
            });

            const languagesResponse = await LanguagesAPI.getLanguages(this.props.match.params.projectId, {
                showAll: true
            });

            this.setState({
                projectExportConfigsResponse: projectExportConfigsResponse,
                languagesResponse: languagesResponse
            });
        } catch (err) {
            console.error(err);
        }

        this.setState({ projectExportConfigsLoading: false });
    };

    getListData = () => {
        if (!this.state.projectExportConfigsResponse) {
            return [];
        }

        return this.state.projectExportConfigsResponse.data;
    };

    getPanelHeader = (title: string) => {
        return title;
    };

    onDelete = async (exportConfig: any) => {
        this.setState({
            isDeleting: true
        });
        Modal.confirm({
            title: "Do you really want to delete this export target?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            onOk: async () => {
                await ExportConfigsAPI.deleteExportConfig({
                    projectId: this.props.match.params.projectId,
                    exportConfigId: exportConfig.id
                });

                await this.fetchData();

                this.setState({
                    isDeleting: false
                });
            },
            onCancel: () => {
                this.setState({
                    isDeleting: false
                });
            }
        });
    };

    render() {
        return (
            <LayoutWithSubSidebar>
                <ExportSidebar projectId={this.props.match.params.projectId} />

                <LayoutWithSubSidebarInner smallWidth>
                    <Breadcrumbs breadcrumbName="projectExportConfigurations" />
                    <LayoutWithSubSidebarInnerContent>
                        <h1>Targets</h1>
                        <p>Specify in which formats you can export your translations.</p>
                        <div style={{ marginBottom: 8 }}>
                            <Button
                                onClick={() => {
                                    this.setState({ addEditExportConfigOpen: true });
                                }}
                                data-id="configurations-site-new-button"
                            >
                                Create new
                            </Button>
                        </div>

                        {this.state.projectExportConfigsLoading && (
                            <>
                                <Skeleton />
                                <Skeleton />
                            </>
                        )}

                        {!this.state.projectExportConfigsLoading && this.getListData().length === 0 && (
                            <Empty
                                description="No data available"
                                style={{ margin: "40px 0" }}
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}

                        {!this.state.projectExportConfigsLoading && (
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                                {this.getListData().map((exportConfig) => {
                                    return (
                                        <ProjectExportConfig
                                            key={exportConfig.id}
                                            exportConfig={exportConfig}
                                            exportConfigsResponse={this.state.projectExportConfigsResponse}
                                            style={{ margin: "0 16px 16px 0" }}
                                            onEdit={() => {
                                                this.setState({
                                                    addEditExportConfigOpen: true,
                                                    exportConfigToEdit: exportConfig
                                                });
                                            }}
                                            onDelete={() => {
                                                this.setState({ exportConfigToEdit: null }, () => {
                                                    this.onDelete(exportConfig);
                                                });
                                            }}
                                            languagesResponse={this.state.languagesResponse}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </LayoutWithSubSidebarInnerContent>

                    <TexterifyModal
                        title={this.state.exportConfigToEdit ? "Edit export target" : "Add a new export target"}
                        visible={this.state.addEditExportConfigOpen}
                        footer={
                            <div style={{ margin: "6px 0" }}>
                                <Button
                                    onClick={() => {
                                        this.setState({ addEditExportConfigOpen: false });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button form="addEditExportConfigForm" type="primary" htmlType="submit">
                                    {this.state.exportConfigToEdit ? "Save changes" : "Create export target"}
                                </Button>
                            </div>
                        }
                        onCancel={async () => {
                            await this.fetchData();
                            this.setState({ addEditExportConfigOpen: false, exportConfigToEdit: null });
                        }}
                    >
                        <AddEditExportConfigForm
                            projectId={this.props.match.params.projectId}
                            exportConfigToEdit={this.state.exportConfigToEdit}
                            hideDefaultSubmitButton
                            onCreated={async () => {
                                this.setState({
                                    addEditExportConfigOpen: false,
                                    exportConfigToEdit: null
                                });
                                await this.fetchData();
                            }}
                        />
                    </TexterifyModal>
                </LayoutWithSubSidebarInner>
            </LayoutWithSubSidebar>
        );
    }
}

export { ProjectExportConfigsSite };
