import { DownloadOutlined } from "@ant-design/icons";
import { Alert, Button, message, Skeleton } from "antd";
import * as moment from "moment";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { ExportSidebar } from "./ExportSidebar";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    languagesLoaded: boolean;
    languages: any[];
    languagesIncluded: any[];
    responseExportConfigs: any;
    downloadLoading: string;
}

class ProjectExportDownloadSite extends React.Component<IProps, IState> {
    state: IState = {
        languages: [],
        languagesIncluded: [],
        languagesLoaded: false,
        responseExportConfigs: null,
        downloadLoading: null
    };

    async componentDidMount() {
        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, {
                showAll: true
            });
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
                    <>
                        <Link
                            to={Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                                ":projectId",
                                this.props.match.params.projectId
                            )}
                        >
                            Create an export configuration
                        </Link>{" "}
                        to export your keys.
                    </>
                }
            />
        );
    };

    hasExportConfigs = () => {
        return this.state.responseExportConfigs && this.state.responseExportConfigs.data.length > 0;
    };

    render() {
        return (
            <LayoutWithSubSidebar>
                <ExportSidebar projectId={this.props.match.params.projectId} />

                <LayoutWithSubSidebarInner smallWidth>
                    <Breadcrumbs breadcrumbName="projectExportDownload" />
                    <LayoutWithSubSidebarInnerContent>
                        <h1>Download</h1>

                        {!this.state.languagesLoaded && (
                            <>
                                <Skeleton />
                                <Skeleton />
                            </>
                        )}

                        {this.state.languagesLoaded && this.state.languages.length === 0 && (
                            <Alert
                                type="info"
                                showIcon
                                message="No language"
                                description={
                                    <>
                                        <Link
                                            to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                ":projectId",
                                                this.props.match.params.projectId
                                            )}
                                        >
                                            Create a language
                                        </Link>{" "}
                                        to export your keys.
                                    </>
                                }
                            />
                        )}
                        {this.state.responseExportConfigs !== null &&
                            !this.hasExportConfigs() &&
                            this.renderNoExportConfigsInfo()}
                        {this.hasExportConfigs() && this.state.languages.length > 0 && (
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex", flexDirection: "column", marginRight: 16 }}>
                                    <p>
                                        The configuration specifies the format of your exported files and translations.
                                    </p>
                                    {this.state.responseExportConfigs?.data.map((exportConfig) => {
                                        return (
                                            <div
                                                key={exportConfig.id}
                                                style={{
                                                    padding: "8px 0",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center"
                                                }}
                                            >
                                                {exportConfig.attributes.name}
                                                <Button
                                                    type="primary"
                                                    loading={this.state.downloadLoading === exportConfig.attributes.id}
                                                    disabled={
                                                        this.state.downloadLoading &&
                                                        this.state.downloadLoading !== exportConfig.attributes.id
                                                    }
                                                    onClick={async () => {
                                                        this.setState({ downloadLoading: exportConfig.attributes.id });
                                                        const response = await ProjectsAPI.export({
                                                            projectId: this.props.match.params.projectId,
                                                            exportConfigId: exportConfig.attributes.id,
                                                            fileName: `${
                                                                dashboardStore.currentProject.attributes.name
                                                            }-${moment().format("DD-MM-YYYY")}-${new Date().getTime()}`
                                                        });
                                                        this.setState({ downloadLoading: null });

                                                        if (response.status !== 200) {
                                                            message.error("An error occured during the export.");
                                                        }
                                                    }}
                                                    icon={<DownloadOutlined />}
                                                    style={{ marginLeft: 24 }}
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        );
                                    })}
                                    {/* <Select
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
                                </div> */}
                                </div>
                            </div>
                        )}
                    </LayoutWithSubSidebarInnerContent>
                </LayoutWithSubSidebarInner>
            </LayoutWithSubSidebar>
        );
    }
}

export { ProjectExportDownloadSite };
