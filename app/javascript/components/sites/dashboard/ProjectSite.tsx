import { CrownOutlined, PicRightOutlined } from "@ant-design/icons";
import { Button, Empty, Layout, message, Pagination, Progress, Skeleton, Statistic, Tag, Tooltip } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import { observer } from "mobx-react";
import * as moment from "moment";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { IGetValidationViolationsCountResponse, ValidationViolationsAPI } from "../../api/v1/ValidationViolationsAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Activity } from "../../ui/Activity";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import FlagIcon from "../../ui/FlagIcons";
import { IssuesTag } from "../../ui/IssuesTag";
import { ProjectAvatar } from "../../ui/ProjectAvatar";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    projectLoading: boolean;
    languagesResponse: any;
    languagesLoading: boolean;
    projectActivityResponse: any;
    projectActivityLoading: boolean;
    validationViolationsCountResponse: IGetValidationViolationsCountResponse;
    validationViolationsLoading: boolean;
    languagesPage: number;
    languagesPerPage: number;
}

@observer
class ProjectSite extends React.Component<IProps, IState> {
    state: IState = {
        projectLoading: true,
        languagesResponse: null,
        languagesLoading: true,
        projectActivityResponse: null,
        projectActivityLoading: true,
        validationViolationsCountResponse: null,
        validationViolationsLoading: true,
        languagesPage: 1,
        languagesPerPage: 5
    };

    async componentDidMount() {
        if (!dashboardStore.currentProject.attributes.current_user_deactivated) {
            await Promise.all([
                this.fetchLanguages(),
                this.fetchProject(),
                this.fetchProjectActivity(),
                this.fetchValidationViolations()
            ]);
        }
    }

    async fetchLanguages() {
        this.setState({ languagesLoading: true });

        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, {
                page: this.state.languagesPage,
                perPage: this.state.languagesPerPage
            });

            this.setState({
                languagesResponse: responseLanguages
            });
        } catch (error) {
            console.error(error);
            message.error("Failed to load languages.");
        }

        this.setState({ languagesLoading: false });
    }

    async fetchProjectActivity() {
        if (dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY")) {
            this.setState({ projectActivityLoading: true });

            try {
                const projectActivityResponse = await ProjectsAPI.getActivity({
                    projectId: this.props.match.params.projectId
                });

                this.setState({
                    projectActivityResponse: projectActivityResponse
                });
            } catch (error) {
                console.error(error);
                message.error("Failed to load project activity.");
            }

            this.setState({
                projectActivityLoading: false
            });
        }
    }

    async fetchValidationViolations() {
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS")) {
            this.setState({ validationViolationsLoading: true });

            try {
                const validationViolationsCountResponse = await ValidationViolationsAPI.getCount({
                    projectId: this.props.match.params.projectId
                });

                if (dashboardStore.currentProject) {
                    dashboardStore.currentProject.attributes.issues_count = validationViolationsCountResponse.total;
                }

                this.setState({
                    validationViolationsCountResponse: validationViolationsCountResponse
                });
            } catch (error) {
                console.error(error);
                message.error("Failed to load violations.");
            }
        }

        this.setState({
            validationViolationsLoading: false
        });
    }

    async fetchProject() {
        this.setState({ projectLoading: true });

        try {
            await dashboardStore.loadProject(this.props.match.params.projectId);
        } catch (error) {
            console.error(error);
            message.error("Failed to load project.");
        }

        this.setState({ projectLoading: false });
    }

    renderLanguagesProgress = () => {
        const languages =
            this.state.languagesResponse && this.state.languagesResponse.data ? this.state.languagesResponse.data : [];

        return (
            <>
                <h3>Progress</h3>
                {this.state.languagesLoading && <Skeleton active />}
                {!this.state.languagesLoading && languages.length === 0 && (
                    <Empty
                        description={
                            <>
                                <Link
                                    to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                        ":projectId",
                                        this.props.match.params.projectId
                                    )}
                                >
                                    Add some languages
                                </Link>{" "}
                                to show your progress here
                            </>
                        }
                        style={{ margin: "40px 0" }}
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                )}
                {!this.state.languagesLoading &&
                    languages.map((language, index) => {
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
                                        Show all untranslated
                                    </Link>
                                    <Link
                                        to={
                                            Routes.DASHBOARD.PROJECT_KEYS.replace(
                                                ":projectId",
                                                this.props.match.params.projectId
                                            ) +
                                            `?ca=${moment().subtract(7, "days").format("YYYY-MM-DD")}&l=${language.id}`
                                        }
                                        style={{ marginLeft: 24 }}
                                    >
                                        Show changed in last 7 days
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
                        <h1
                            style={{ display: "flex", alignItems: "center", marginBottom: 0 }}
                            data-id="project-home-name"
                        >
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
                        <p style={{ marginTop: 16 }} data-id="project-home-description">
                            {dashboardStore.currentProject?.attributes.description}
                        </p>
                    )}
                    <div style={{ display: "flex", marginTop: 40 }}>
                        <div style={{ width: "50%", marginRight: 40 }}>
                            {this.renderLanguagesProgress()}

                            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                                <Pagination
                                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                                    showSizeChanger
                                    pageSize={this.state.languagesPerPage}
                                    current={this.state.languagesPage}
                                    total={this.state.languagesResponse?.meta?.total || 0}
                                    onChange={async (page: number, perPage: number) => {
                                        const isPageSizeChange = perPage !== this.state.languagesPerPage;

                                        if (isPageSizeChange) {
                                            this.setState({ languagesPage: 1, languagesPerPage: perPage }, () => {
                                                this.fetchLanguages();
                                            });
                                        } else {
                                            this.setState({ languagesPage: page }, () => {
                                                this.fetchLanguages();
                                            });
                                        }

                                        this.setState({ languagesPage: page }, () => {
                                            this.fetchLanguages();
                                        });
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ width: "50%", marginLeft: 40 }}>
                            <h3>Issues</h3>
                            <div style={{ display: "flex" }}>
                                {dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                    <>
                                        <IssuesTag
                                            loading={this.state.validationViolationsLoading}
                                            projectId={this.props.match.params.projectId}
                                            issuesCount={this.state.validationViolationsCountResponse?.total || 0}
                                        />

                                        <Link
                                            to={Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE.replace(
                                                ":projectId",
                                                this.props.match.params.projectId
                                            )}
                                            style={{ marginLeft: 24 }}
                                        >
                                            View issues
                                        </Link>
                                    </>
                                )}

                                {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                    <FeatureNotAvailable feature="FEATURE_VALIDATIONS" />
                                )}
                            </div>

                            <h3 style={{ marginTop: 40 }}>Statistics</h3>
                            <div style={{ display: "flex" }}>
                                <Statistic
                                    title="Words"
                                    value={dashboardStore.currentProject?.attributes.word_count}
                                    loading={this.state.projectLoading}
                                    className="big data-id-project-home-word"
                                />
                                <Statistic
                                    title="Characters"
                                    value={dashboardStore.currentProject?.attributes.character_count}
                                    loading={this.state.projectLoading}
                                    style={{ marginLeft: 40 }}
                                    className="big data-id-project-home-characters"
                                />
                            </div>

                            <h3 style={{ marginTop: 40 }}>Activity</h3>
                            {!dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY") && (
                                <FeatureNotAvailable feature="FEATURE_PROJECT_ACTIVITY" />
                            )}
                            {!this.state.projectActivityLoading &&
                                dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY") && (
                                    <Activity activitiesResponse={this.state.projectActivityResponse} />
                                )}
                            {this.state.projectActivityLoading &&
                                dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY") && <Skeleton active />}
                        </div>
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectSite };
