import { Alert, Button, Collapse, Layout, message, Modal } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { NewProjectForm } from "../../forms/NewProjectForm";
import { TransferProjectFormModal } from "../../forms/TransferProjectFormModal";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { PermissionUtils } from "../../utilities/PermissionUtils";
const { Content } = Layout;

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    isDeletingProject: boolean;
    transferProjectModalVisible: boolean;
}

@observer
class ProjectSettingsSite extends React.Component<IProps, IState> {
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
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="projectSettings" />
                <Content style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}>
                    <h1>Settings</h1>
                    <Collapse bordered={false} defaultActiveKey="general">
                        <Collapse.Panel header="General settings" key="general">
                            <SettingsSectionWrapper>
                                <NewProjectForm
                                    isEdit
                                    onChanged={() => {
                                        message.success("Successfully updated project settings.");
                                    }}
                                />
                                <Button
                                    form="newProjectForm"
                                    type="primary"
                                    htmlType="submit"
                                    style={{ alignSelf: "flex-end" }}
                                >
                                    Save
                                </Button>
                            </SettingsSectionWrapper>
                        </Collapse.Panel>
                        <Collapse.Panel
                            header="Advanced settings"
                            key="advanced"
                            collapsible={
                                !PermissionUtils.isOwner(dashboardStore.getCurrentRole()) ? "disabled" : undefined
                            }
                        >
                            <SettingsSectionWrapper>
                                <Alert
                                    message="Remove project"
                                    description={
                                        <>
                                            <p>
                                                Removing the project will delete the project and all ressources related
                                                to the project.
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
                                >
                                    Remove project
                                </Button>

                                <Alert
                                    message="Transfer project"
                                    description={
                                        <>
                                            <p>
                                                Transfering this project to an organization will make it available to
                                                the users of the organization.
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
                                >
                                    Transfer project
                                </Button>
                            </SettingsSectionWrapper>
                        </Collapse.Panel>
                    </Collapse>
                </Content>

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
            </Layout>
        );
    }
}

export { ProjectSettingsSite };
