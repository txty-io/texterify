import { CrownOutlined, PicRightOutlined } from "@ant-design/icons";
import { Button, Empty, Layout, Progress, Skeleton, Tooltip } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Activity } from "../../ui/Activity";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import FlagIcon from "../../ui/FlagIcons";
import { ProjectAvatar } from "../../ui/ProjectAvatar";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    languagesResponse: any;
    projectActivityResponse: any;
}

@observer
class ProjectSite extends React.Component<IProps, IState> {
    state: IState = {
        languagesResponse: null,
        projectActivityResponse: null
    };

    async componentDidMount() {
        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);

            this.setState({
                languagesResponse: responseLanguages
            });

            if (dashboardStore.featureEnabled("FEATURE_EXPORT_HIERARCHY")) {
                const projectActivityResponse = await ProjectsAPI.getActivity({
                    projectId: this.props.match.params.projectId
                });

                this.setState({
                    projectActivityResponse: projectActivityResponse
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    renderLanguagesProgress = () => {
        const languages =
            this.state.languagesResponse && this.state.languagesResponse.data ? this.state.languagesResponse.data : [];

        return (
            <>
                <h3>Progress</h3>
                {!this.state.languagesResponse && <Skeleton active />}
                {this.state.languagesResponse && languages.length === 0 && (
                    <Empty
                        description="No data available"
                        style={{ margin: "40px 0" }}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
                {languages.map((language, index) => {
                    const countryCode = APIUtils.getIncludedObject(
                        language.relationships.country_code.data,
                        this.state.languagesResponse.included
                    );

                    return (
                        <div key={index}>
                            <div style={{ display: "flex", marginTop: 24, alignItems: "center" }}>
                                {language.attributes.is_default && (
                                    <div style={{ textAlign: "center", marginRight: 8 }}>
                                        <Tooltip title="Default language">
                                            <CrownOutlined style={{ color: "#d6ad13", fontSize: 16 }} />
                                        </Tooltip>
                                    </div>
                                )}
                                {countryCode && (
                                    <span style={{ marginRight: 8 }}>
                                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                    </span>
                                )}
                                <div style={{ color: "#a7a7a7" }}>{language.attributes.name}</div>
                            </div>
                            <Progress
                                style={{ marginTop: 8 }}
                                percent={parseFloat(language.attributes.progress.toFixed(2))}
                            />
                            <div style={{ marginTop: 4 }}>
                                <Link
                                    to={
                                        Routes.DASHBOARD.PROJECT_KEYS.replace(
                                            ":projectId",
                                            this.props.match.params.projectId
                                        ) + `?ou=true&l=${language.id}`
                                    }
                                >
                                    All untranslated
                                </Link>
                                <Link
                                    to={
                                        Routes.DASHBOARD.PROJECT_KEYS.replace(
                                            ":projectId",
                                            this.props.match.params.projectId
                                        ) + `?ca=${moment().subtract(7, "days").format("YYYY-MM-DD")}&l=${language.id}`
                                    }
                                    style={{ marginLeft: 24 }}
                                >
                                    Changed last 7 days
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="project" />
                <Layout.Content
                    style={{
                        margin: "24px 16px 0",
                        minHeight: 360,
                        paddingBottom: 40,
                        display: "flex",
                        flexDirection: "column"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                        <h1 style={{ display: "flex", alignItems: "center", marginBottom: 0 }}>
                            <ProjectAvatar project={dashboardStore.currentProject} style={{ marginRight: 16 }} />
                            {dashboardStore.currentProject && dashboardStore.currentProject.attributes.name}
                        </h1>
                        <Button
                            type="primary"
                            onClick={() => {
                                history.push(
                                    Routes.DASHBOARD.PROJECT_EDITOR.replace(
                                        ":projectId",
                                        this.props.match.params.projectId
                                    )
                                );
                            }}
                            style={{ marginLeft: 80 }}
                        >
                            <PicRightOutlined /> Open editor
                        </Button>
                        <div style={{ marginLeft: 80, display: "flex", flexDirection: "column", fontSize: 13 }}>
                            <span style={{ fontWeight: "bold", color: "var(--highlight-color)" }}>Project ID:</span>
                            <Paragraph
                                style={{ marginBottom: 0, marginTop: 4 }}
                                code
                                copyable={{ text: this.props.match.params.projectId }}
                            >
                                {`${this.props.match.params.projectId}`}
                            </Paragraph>
                        </div>
                    </div>
                    {dashboardStore.currentProject?.attributes.description && (
                        <p style={{ marginTop: 16 }}>{dashboardStore.currentProject?.attributes.description}</p>
                    )}
                    <div style={{ display: "flex", marginTop: 40 }}>
                        <div style={{ width: "50%", marginRight: 40 }}>{this.renderLanguagesProgress()}</div>

                        <div style={{ width: "50%", marginLeft: 40 }}>
                            <h3>Activity</h3>
                            {!dashboardStore.featureEnabled("FEATURE_EXPORT_HIERARCHY") && (
                                <FeatureNotAvailable feature="FEATURE_EXPORT_HIERARCHY" />
                            )}
                            {this.state.projectActivityResponse &&
                                dashboardStore.featureEnabled("FEATURE_EXPORT_HIERARCHY") && (
                                    <Activity activitiesResponse={this.state.projectActivityResponse} />
                                )}
                            {!this.state.projectActivityResponse &&
                                dashboardStore.featureEnabled("FEATURE_EXPORT_HIERARCHY") && <Skeleton active />}
                        </div>
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectSite };
