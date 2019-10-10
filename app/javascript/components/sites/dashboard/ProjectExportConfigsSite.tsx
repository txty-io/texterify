import { Button, Empty, Layout, Modal } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { AddEditExportConfigForm } from "../../forms/AddEditExportConfigForm";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
import { ProjectExportConfig } from "../../ui/ProjectExportConfig";
const { Content } = Layout;

type IProps = RouteComponentProps<{ projectId: string }>;
type IState = {
  projectExportConfigsResponse: any;
  languagesResponse: any;
  exportConfigToEdit: any;
  addEditExportConfigOpen: boolean;
  isDeleting: boolean;
};

@observer
class ProjectExportConfigsSite extends React.Component<IProps, IState> {
  state: IState = {
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
    try {
      const projectExportConfigsResponse = await ExportConfigsAPI.getExportConfigs({
        projectId: this.props.match.params.projectId
      });

      const languagesResponse = await LanguagesAPI.getLanguages(this.props.match.params.projectId);

      this.setState({
        projectExportConfigsResponse: projectExportConfigsResponse,
        languagesResponse: languagesResponse
      });
    } catch (err) {
      console.error(err);
    }
  }

  getListData = () => {
    if (!this.state.projectExportConfigsResponse) {
      return [];
    }

    return this.state.projectExportConfigsResponse.data;
  }

  getPanelHeader = (title: string) => {
    return title;
  }

  onDelete = async (exportConfig: any) => {
    this.setState({
      isDeleting: true
    });
    Modal.confirm({
      title: "Do you really want to delete this export configuration?",
      content: "This cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
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
  }

  render() {
    if (!this.state.projectExportConfigsResponse) {
      return <Loading />;
    }

    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
        <Breadcrumbs breadcrumbName="projectExportConfigurations" />
        <Content style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}>
          <h1>Configurations</h1>
          <p>Specify in which formats you can export your translations.</p>
          <div style={{ marginBottom: 8 }}>
            <Button onClick={() => { this.setState({ addEditExportConfigOpen: true }); }}>
              Create new
            </Button>
          </div>

          {this.getListData().length === 0 && (
            <Empty
              description="No data available"
              style={{ margin: "40px 0" }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {this.getListData().map((exportConfig) => {
              return (
                <ProjectExportConfig
                  key={exportConfig.id}
                  exportConfig={exportConfig}
                  style={{ margin: "0 16px 16px 0" }}
                  onEdit={() => { this.setState({ addEditExportConfigOpen: true, exportConfigToEdit: exportConfig }); }}
                  onDelete={() => { this.setState({ exportConfigToEdit: null }, () => this.onDelete(exportConfig)); }}
                  languagesResponse={this.state.languagesResponse}
                />
              );
            })}
          </div>
        </Content>

        <Modal
          maskClosable={false}
          title={this.state.exportConfigToEdit ? "Edit export config" : "Add a new export config"}
          visible={this.state.addEditExportConfigOpen}
          footer={
            <div style={{ margin: "6px 0" }}>
              <Button onClick={() => { this.setState({ addEditExportConfigOpen: false }); }}>
                Cancel
              </Button>
              <Button form="addEditExportConfigForm" type="primary" htmlType="submit">
                {this.state.exportConfigToEdit ? "Save changes" : "Create export config"}
              </Button>
            </div>}
          onCancel={() => { this.setState({ addEditExportConfigOpen: false, exportConfigToEdit: null }); }}
          destroyOnClose
        >
          <AddEditExportConfigForm
            projectId={this.props.match.params.projectId}
            exportConfigToEdit={this.state.exportConfigToEdit}
            visible={this.state.addEditExportConfigOpen}
            onCreated={async () => {
              this.setState({
                addEditExportConfigOpen: false,
                exportConfigToEdit: null
              });
              await this.fetchData();
            }}
          />
        </Modal>
      </Layout>
    );
  }
}

export { ProjectExportConfigsSite };
