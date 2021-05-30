import { Layout, List } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { IGetProjects, ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { MachineTranslationEnabledMessage } from "../../ui/MachineTranslationEnabledMessage";

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    projectsLoading: boolean;
    projectsResponse: IGetProjects;
}

@observer
class OrganizationMachineTranslationSite extends React.Component<IProps, IState> {
    state: IState = {
        projectsLoading: true,
        projectsResponse: null
    };

    async componentDidMount() {
        await this.fetchProjects();
    }

    fetchProjects = async () => {
        try {
            this.setState({ projectsLoading: true });
            const responseProjects = await ProjectsAPI.getProjects();

            this.setState({
                projectsLoading: false,
                projectsResponse: responseProjects
            });
        } catch (error) {
            console.error(error);
        }
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="organizationMachineTranslation" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360, maxWidth: 960 }}>
                        <h1>Machine Translation</h1>
                        <p>Get an overview of your machine translation usage.</p>
                        <div style={{ display: "flex" }}>
                            <div style={{ marginRight: 80, width: "40%" }}>
                                <h3>Total usage</h3>
                                <p>This is the total amount of characters machine translated over all your projects.</p>
                                <div style={{ display: "flex", fontSize: 16 }}>
                                    <span style={{ fontWeight: "bold", marginRight: 24 }}>Usage:</span>
                                    {dashboardStore.currentOrganization?.attributes.machine_translation_character_usage}
                                    /
                                    {dashboardStore.currentOrganization?.attributes.machine_translation_character_limit}
                                </div>
                            </div>
                            <div style={{ width: "60%" }}>
                                <h3>Usage by project</h3>
                                <List
                                    itemLayout="horizontal"
                                    loading={this.state.projectsLoading}
                                    dataSource={this.state.projectsResponse?.data.map((project) => {
                                        return {
                                            project: project
                                        };
                                    })}
                                    renderItem={(item) => {
                                        return (
                                            <List.Item>
                                                <div style={{ width: "100%" }}>
                                                    <div style={{ display: "flex", width: "100%" }}>
                                                        <div
                                                            style={{ flexGrow: 1, fontWeight: "bold", marginRight: 40 }}
                                                        >
                                                            Name
                                                        </div>
                                                        <div
                                                            style={{
                                                                flexShrink: 0,
                                                                width: 120,
                                                                fontWeight: "bold",
                                                                marginRight: 40
                                                            }}
                                                        >
                                                            Usage
                                                        </div>
                                                        <div style={{ flexShrink: 0, width: 240, fontWeight: "bold" }}>
                                                            Status
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            width: "100%",
                                                            marginRight: 40,
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        <div style={{ flexGrow: 1, marginRight: 40 }}>
                                                            {item.project.attributes.name}
                                                        </div>
                                                        <div style={{ flexShrink: 0, width: 120, marginRight: 40 }}>
                                                            {
                                                                item.project.attributes
                                                                    .machine_translation_character_usage
                                                            }
                                                        </div>
                                                        <div style={{ flexShrink: 0, width: 240 }}>
                                                            <MachineTranslationEnabledMessage project={item.project} />
                                                        </div>
                                                    </div>
                                                    <div style={{ marginTop: 8 }}>
                                                        <a
                                                            onClick={() => {
                                                                history.push(
                                                                    Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION.replace(
                                                                        ":projectId",
                                                                        item.project.id
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            Go to project machine translation site
                                                        </a>
                                                    </div>
                                                </div>
                                            </List.Item>
                                        );
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </div>
                        </div>
                    </Layout.Content>
                </Layout>
            </>
        );
    }
}

export { OrganizationMachineTranslationSite };
