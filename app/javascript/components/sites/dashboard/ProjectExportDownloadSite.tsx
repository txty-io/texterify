import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, Layout, message, Select } from "antd";
import * as moment from "moment";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Styles } from "../../ui/Styles";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    languagesLoaded: boolean;
    languages: any[];
    languagesIncluded: any[];
    exportConfigId: string;
    responseExportConfigs: any;
    downloadLoading: boolean;
}

class ProjectExportDownloadSite extends React.Component<IProps, IState> {
    state: IState = {
        languages: [],
        languagesIncluded: [],
        languagesLoaded: false,
        exportConfigId: "",
        responseExportConfigs: null,
        downloadLoading: false
    };

    async componentDidMount() {
        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);
            const responseExportConfigs = await ExportConfigsAPI.getExportConfigs({
                projectId: this.props.match.params.projectId
            });

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
                message="No export configuration"
                style={{ marginTop: this.state.languagesLoaded && this.state.languages.length === 0 ? 8 : 0 }}
                description={
                    <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
                        <Link
                            to={Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                                ":projectId",
                                this.props.match.params.projectId
                            )}
                        >
                            Create an export configuration
                        </Link>{" "}
                        to export your keys.
                    </p>
                }
            />
        );
    };

    hasExportConfigs = () => {
        return this.state.responseExportConfigs && this.state.responseExportConfigs.data.length > 0;
    };

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="projectExportDownload" />
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 400 }}>
                    <h1>Download</h1>
                    {this.state.languagesLoaded && this.state.languages.length === 0 && (
                        <>
                            <Alert
                                type="info"
                                showIcon
                                message="No language"
                                description={
                                    <>
                                        <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
                                            <Link
                                                to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                    ":projectId",
                                                    this.props.match.params.projectId
                                                )}
                                            >
                                                Create a language
                                            </Link>{" "}
                                            to export your keys.
                                        </p>
                                    </>
                                }
                            />
                        </>
                    )}
                    {this.state.responseExportConfigs !== null &&
                        !this.hasExportConfigs() &&
                        this.renderNoExportConfigsInfo()}
                    {this.hasExportConfigs() && this.state.languages.length > 0 && (
                        <div style={{ display: "flex" }}>
                            <div style={{ display: "flex", flexDirection: "column", marginRight: 16 }}>
                                <h3>Export configuration</h3>
                                <p>The configuration specifies the format of your exported files and translations.</p>
                                <Select
                                    placeholder="Select a configuration"
                                    style={{ width: "100%" }}
                                    onChange={(value: string) => {
                                        this.setState({ exportConfigId: value });
                                    }}
                                >
                                    {this.state.responseExportConfigs &&
                                        this.state.responseExportConfigs.data.map((exportConfig) => {
                                            return (
                                                <Select.Option value={exportConfig.id} key={exportConfig.id}>
                                                    {exportConfig.attributes.name}
                                                </Select.Option>
                                            );
                                        })}
                                </Select>
                                <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
                                    <Button
                                        type="primary"
                                        disabled={!this.state.exportConfigId}
                                        loading={this.state.downloadLoading}
                                        onClick={async () => {
                                            this.setState({ downloadLoading: true });
                                            const response = await ProjectsAPI.export({
                                                projectId: this.props.match.params.projectId,
                                                exportConfigId: this.state.exportConfigId,
                                                fileName: `${
                                                    dashboardStore.currentProject.attributes.name
                                                }-${moment().format("DD-MM-YYYY")}-${new Date().getTime()}`
                                            });
                                            this.setState({ downloadLoading: false });

                                            if (response.status !== 200) {
                                                message.error("An error occured during the export.");
                                            }
                                        }}
                                        icon={<DownloadOutlined />}
                                    >
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectExportDownloadSite };
