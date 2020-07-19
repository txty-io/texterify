import { Empty, Layout, Progress } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { dashboardStore } from "../../stores/DashboardStore";
import { Activity } from "../../ui/Activity";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import FlagIcon from "../../ui/FlagIcons";
import { Loading } from "../../ui/Loading";
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

            const projectActivityResponse = await ProjectsAPI.getActivity({
                projectId: this.props.match.params.projectId
            });

            this.setState({
                languagesResponse: responseLanguages,
                projectActivityResponse: projectActivityResponse
            });
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
                {languages.length === 0 && (
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
                            <div style={{ display: "flex", marginTop: 24 }}>
                                {countryCode && (
                                    <span style={{ marginRight: 8 }}>
                                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                    </span>
                                )}
                                <h4 style={{ color: "#a7a7a7" }}>{language.attributes.name}</h4>
                            </div>
                            <Progress percent={parseFloat(language.attributes.progress.toFixed(2))} />
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
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, paddingBottom: 40 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                        <h1 style={{ display: "flex", alignItems: "center", marginBottom: 0 }}>
                            <ProjectAvatar project={dashboardStore.currentProject} style={{ marginRight: 16 }} />
                            {dashboardStore.currentProject && dashboardStore.currentProject.attributes.name}
                        </h1>
                        <div style={{ marginLeft: 80, display: "flex", flexDirection: "column", fontSize: 13 }}>
                            <span style={{ fontWeight: "bold" }}>Project ID:</span>
                            <Paragraph
                                style={{ marginBottom: 0 }}
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
                    {this.state.languagesResponse && this.state.projectActivityResponse ? (
                        <>
                            <div style={{ display: "flex", marginTop: 40 }}>
                                <div style={{ width: "50%", marginRight: 40 }}>{this.renderLanguagesProgress()}</div>
                                <div style={{ width: "50%", marginLeft: 40 }}>
                                    <h3>Activity</h3>
                                    <Activity activitiesResponse={this.state.projectActivityResponse} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <Loading />
                    )}
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectSite };
