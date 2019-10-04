import { Alert, Button, Icon, Layout, message, Select, Tree } from "antd";
import * as moment from "moment";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import FlagIcon from "../../ui/FlagIcons";
import { Styles } from "../../ui/Styles";

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  languagesLoaded: boolean;
  languages: any[];
  languagesIncluded: any[];
  exportConfigId: string;
  responseExportConfigs: any;
}

class ProjectExportDownloadSite extends React.Component<IProps, IState> {
  state: IState = {
    languages: [],
    languagesIncluded: [],
    languagesLoaded: false,
    exportConfigId: "",
    responseExportConfigs: null
  };

  async componentDidMount() {
    try {
      const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);
      const responseExportConfigs = await ExportConfigsAPI.getExportConfigs({ projectId: this.props.match.params.projectId });

      this.setState({
        languagesLoaded: true,
        languages: responseLanguages.data,
        languagesIncluded: responseLanguages.included,
        responseExportConfigs
      });
    } catch (e) {
      console.error(e);
    }
  }

  renderNoExportConfigsInfo = () => {
    return (
      <Alert
        type="info"
        showIcon
        message={<>No export configurations.</>}
        description={
          <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
            You must first <Link to={Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(":projectId", this.props.match.params.projectId)}>
              create an export configuration</Link> before you can export your keys.
          </p>
        }
      />
    );
  }

  hasExportConfigs = () => {
    return this.state.responseExportConfigs && this.state.responseExportConfigs.data.length > 0;
  }

  render() {
    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
        <Breadcrumbs breadcrumbName="projectExportDownload" />
        <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 800 }}>
          <h1>Download</h1>
          {this.state.languagesLoaded && this.state.languages.length === 0 &&
            <>
              <Alert
                type="info"
                showIcon
                message={<>No languages.</>}
                description={
                  <>
                    <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
                      You must first <Link to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", this.props.match.params.projectId)}>
                        create a language </Link> before you can export your keys.
                      </p>
                  </>
                }
              />
            </>
          }
          {this.state.responseExportConfigs !== null && !this.hasExportConfigs() && this.renderNoExportConfigsInfo()}
          {this.hasExportConfigs() && this.state.languages.length > 0 &&
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", flexDirection: "column", width: "40%", marginRight: 16 }}>
                <h3>Export format</h3>
                <Select
                  placeholder="Select a format"
                  style={{ width: "100%" }}
                  onChange={(value: string) => {
                    this.setState({ exportConfigId: value });
                  }}
                >
                  {(this.state.responseExportConfigs && this.state.responseExportConfigs.data.map((exportConfig) => {
                    return <Select.Option value={exportConfig.id} key={exportConfig.id}>{exportConfig.attributes.name}</Select.Option>;
                  }))}
                </Select>
                <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="primary"
                    onClick={async () => {
                      const response = await ProjectsAPI.export({
                        projectId: this.props.match.params.projectId,
                        exportConfigId: this.state.exportConfigId,
                        fileName: `${dashboardStore.currentProject.attributes.name}-${moment().format("DD-MM-YYYY")}-${(new Date()).getTime()}`
                      });

                      if (response.status !== 200) {
                        message.error("An error occured during the export.");
                      }
                    }}
                    icon="download"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </div>
          }
        </Layout.Content>
      </Layout>
    );
  }
}

export { ProjectExportDownloadSite };
