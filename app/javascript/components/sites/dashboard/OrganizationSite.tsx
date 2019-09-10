import { Button, Layout, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { NewProjectFormModal } from "../../forms/NewProjectFormModal";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { OrganizationAvatar } from "../../ui/OrganizationAvatar";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { ProjectAvatar } from "../../ui/ProjectAvatar";
import { ProjectsList } from "../../ui/ProjectsList";

type IProps = RouteComponentProps<{ organizationId: string }> & {};
type IState = {
  addDialogVisible: boolean;
  responseOrganization: any;
};

@observer
class OrganizationSite extends React.Component<IProps, IState> {
  state: IState = {
    addDialogVisible: false,
    responseOrganization: null
  };

  async componentDidMount() {
    try {
      const responseOrganization = await OrganizationsAPI.getOrganization(this.props.match.params.organizationId);

      this.setState({
        responseOrganization: responseOrganization
      });
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <>
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
          <Breadcrumbs breadcrumbName="organization" />
          <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 640 }}>
            <h1 style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
              <OrganizationAvatar organization={dashboardStore.currentOrganization} style={{ marginRight: 16 }} />
              {dashboardStore.currentOrganization && dashboardStore.currentOrganization.attributes.name}
              <PrimaryButton
                style={{ marginLeft: 40 }}
                onClick={() => { this.setState({ addDialogVisible: true }); }}
              >
                Create project
              </PrimaryButton>
            </h1>
            <div style={{ display: "flex", marginTop: 40 }}>
              <div style={{ width: "100%" }}>
                <h3 style={{ marginBottom: 24 }}>Projects</h3>
                <ProjectsList
                  projects={
                    this.state.responseOrganization ?
                      this.state.responseOrganization.included
                        .filter((included) => included.type === "project") :
                      []
                  }
                />
              </div>
            </div>
          </Layout.Content>
        </Layout>

        <NewProjectFormModal
          visible={this.state.addDialogVisible}
          onCancelRequest={() => {
            this.setState({ addDialogVisible: false });
          }}
          newProjectFormProps={{
            organizationId: this.props.match.params.organizationId,
            onCreated: (projectId: string) => {
              this.props.history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", projectId));
            },
            onError: (errors: any) => {
              message.error("Failed to create project.");
            }
          }}
        />
      </>
    );
  }
}

export { OrganizationSite };
