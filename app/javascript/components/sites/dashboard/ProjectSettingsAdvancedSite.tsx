import { Alert, Button, message, Modal } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { TransferProjectFormModal } from "../../forms/TransferProjectFormModal";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import { ProjectSettingsSidebar } from "./ProjectSettingsSidebar";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    isDeletingProject: boolean;
    transferProjectModalVisible: boolean;
}

@observer
class ProjectSettingsAdvancedSite extends React.Component<IProps, IState> {
    state: IState = {
        isDeletingProject: false,
        transferProjectModalVisible: false
    };

    onTransferProjectClick = () => {
        this.setState({ transferProjectModalVisible: true });
    };

    onDeleteProjectClick = () => {
        Modal.confirm({
            title: "Do you really want to delete this project?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            onOk: async () => {
                this.setState({ isDeletingProject: true });
                await ProjectsAPI.deleteProject(this.props.match.params.projectId);
                this.setState({ isDeletingProject: false });
                history.push(Routes.DASHBOARD.PROJECTS);
            },
            onCancel: () => {
                this.setState({ isDeletingProject: false });
            }
        });
    };

    render() {
        return (
            <LayoutWithSubSidebar>
                <ProjectSettingsSidebar projectId={this.props.match.params.projectId} />

                <LayoutWithSubSidebarInner>
                    <Breadcrumbs breadcrumbName="projectSettingsAdvanced" />
                    <LayoutWithSubSidebarInnerContent>
                        <h1>Advanced settings</h1>

                        <SettingsSectionWrapper>
                            <Alert
                                message="Remove project"
                                description={
                                    <>
                                        <p>
                                            Removing the project will delete the project and all ressources related to
                                            the project.
                                        </p>
                                        <p>
                                            <b>This cannot be undone.</b>
                                        </p>
                                    </>
                                }
                                type="warning"
                                showIcon
                            />
                            <Button
                                danger
                                onClick={this.onDeleteProjectClick}
                                style={{ alignSelf: "flex-end", marginTop: 16 }}
                                disabled={!PermissionUtils.isOwner(dashboardStore.getCurrentRole())}
                                data-id="project-advanced-settings-delete"
                            >
                                Remove project
                            </Button>

                            <Alert
                                message="Transfer project"
                                description={
                                    <>
                                        <p>
                                            Transfering this project to an organization will make it available to the
                                            users of the organization.
                                        </p>
                                    </>
                                }
                                type="warning"
                                showIcon
                                style={{ marginTop: 40 }}
                            />
                            <Button
                                danger
                                onClick={this.onTransferProjectClick}
                                style={{ alignSelf: "flex-end", marginTop: 16 }}
                                disabled={!PermissionUtils.isOwner(dashboardStore.getCurrentRole())}
                                data-id="project-advanced-settings-transfer"
                            >
                                Transfer project
                            </Button>
                        </SettingsSectionWrapper>
                    </LayoutWithSubSidebarInnerContent>
                </LayoutWithSubSidebarInner>

                <TransferProjectFormModal
                    visible={this.state.transferProjectModalVisible}
                    project={dashboardStore.currentProject}
                    onClose={() => {
                        this.setState({ transferProjectModalVisible: false });
                    }}
                    onSuccess={async () => {
                        const getProjectResponse = await ProjectsAPI.getProject(this.props.match.params.projectId);
                        if (getProjectResponse.errors) {
                            this.props.history.push(Routes.DASHBOARD.PROJECTS);
                        } else {
                            dashboardStore.currentProject = getProjectResponse.data;
                            dashboardStore.currentProjectIncluded = getProjectResponse.included;
                        }
                        this.setState({ transferProjectModalVisible: false });
                        message.success("Project transferred successfully.");
                        history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", this.props.match.params.projectId));
                    }}
                />
            </LayoutWithSubSidebar>
        );
    }
}

export { ProjectSettingsAdvancedSite };
