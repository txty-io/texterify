import { Alert, Button, Collapse, Layout, message, Modal } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { NewProjectForm } from "../../forms/NewProjectForm";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { PermissionUtils } from "../../utilities/PermissionUtils";
const { Content } = Layout;

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  isDeletingProject: boolean;
}

@observer
class ProjectSettingsSite extends React.Component<IProps, IState> {
  state: IState = {
    isDeletingProject: false
  };

  onDeleteProjectClick = () => {
    Modal.confirm({
      title: "Do you really want to delete this project?",
      content: "This cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        this.setState({ isDeletingProject: true });
        const response = await ProjectsAPI.deleteProject(this.props.match.params.projectId);
        this.setState({ isDeletingProject: false });
        history.push(Routes.DASHBOARD.PROJECTS);
      },
      onCancel: () => {
        this.setState({ isDeletingProject: false });
      }
    });
  }

  render() {
    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
        <Breadcrumbs breadcrumbName="projectSettings" />
        <Content style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}>
          <h1>Settings</h1>
          <Collapse bordered={false}>
            <Collapse.Panel header="General settings" key="general">
              <SettingsSectionWrapper>
                <NewProjectForm
                  isEdit
                  onCreated={(projectId: string) => {
                    message.success("Successfully updated project settings.");
                  }}
                  onError={(errors: any) => {
                    message.error("Error while updating project settings.");
                  }}
                />
                <Button form="newProjectForm" type="primary" htmlType="submit" style={{ alignSelf: "flex-end" }}>
                  Save
                </Button>
              </SettingsSectionWrapper>
            </Collapse.Panel>
            <Collapse.Panel
              header="Advanced settings"
              key="advanced"
              disabled={!PermissionUtils.isOwner(dashboardStore.getCurrentRole())}
            >
              <SettingsSectionWrapper>
                <Alert
                  message="Remove project"
                  description={
                    <>
                      <p>
                        Removing the project will delete the project and all ressources related to the project.
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
                  type="danger"
                  onClick={this.onDeleteProjectClick}
                  style={{ alignSelf: "flex-end", marginTop: 16 }}
                  disabled={!PermissionUtils.isOwner(dashboardStore.getCurrentRole())}
                >
                  Remove project
                </Button>
              </SettingsSectionWrapper>
            </Collapse.Panel>
          </Collapse>
        </Content>
      </Layout>
    );
  }
}

export { ProjectSettingsSite };
