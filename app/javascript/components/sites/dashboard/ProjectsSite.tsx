import { Input, Layout, Pagination } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { NewProjectFormModal } from "../../forms/NewProjectFormModal";
import { Routes } from "../../routing/Routes";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { ProjectsList } from "../../ui/ProjectsList";

type IProps = RouteComponentProps;
interface IState {
    projectsLoading: boolean;
    projectsResponse: any;
    projects: any[];
    addDialogVisible: boolean;
    perPage: number;
    page: number;
    search: string;
}

class ProjectsSiteUnwrapped extends React.Component<IProps, IState> {
    debouncedSearchReloader = _.debounce(
        async (value) => {
            this.setState({ search: value, page: 1 });
            await this.reloadTable({ search: value, page: 1 });
        },
        500,
        { trailing: true }
    );

    state: IState = {
        projectsLoading: true,
        projectsResponse: null,
        projects: [],
        addDialogVisible: false,
        perPage: DEFAULT_PAGE_SIZE,
        page: 1,
        search: ""
    };

    async componentDidMount() {
        await this.reloadTable();
    }

    fetchProjects = async (options?: any) => {
        try {
            this.setState({ projectsLoading: true });
            const responseProjects = await ProjectsAPI.getProjects(options);

            this.setState({
                projectsLoading: false,
                projectsResponse: responseProjects,
                projects: responseProjects.data
            });
        } catch (error) {
            console.error(error);
        }
    };

    reloadTable = async (options?: any) => {
        const fetchOptions = options || {};
        fetchOptions.search = (options && options.search) || this.state.search;
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.fetchProjects(fetchOptions);
    };

    onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchReloader(event.target.value);
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                        <h1 style={{ flexGrow: 1 }}>Projects</h1>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ flexGrow: 1 }}>
                                <PrimaryButton
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                >
                                    Create project
                                </PrimaryButton>
                            </div>
                            <Input.Search
                                placeholder="Search projects"
                                onChange={this.onSearch}
                                style={{ maxWidth: "50%" }}
                            />
                        </div>

                        <ProjectsList
                            loading={this.state.projectsLoading}
                            projects={this.state.projects || []}
                            included={this.state.projectsResponse && this.state.projectsResponse.included}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                            <Pagination
                                pageSizeOptions={PAGE_SIZE_OPTIONS}
                                showSizeChanger
                                pageSize={this.state.perPage}
                                current={this.state.page}
                                total={
                                    (this.state.projectsResponse &&
                                        this.state.projectsResponse.meta &&
                                        this.state.projectsResponse.meta.total) ||
                                    0
                                }
                                onChange={async (page: number, _perPage: number) => {
                                    this.setState({ page: page });
                                    await this.reloadTable({ page: page });
                                }}
                                onShowSizeChange={async (_current: number, size: number) => {
                                    this.setState({ page: 1, perPage: size });
                                    await this.reloadTable({ page: 1, perPage: size });
                                }}
                            />
                        </div>
                    </Layout.Content>
                </Layout>

                <NewProjectFormModal
                    visible={this.state.addDialogVisible}
                    onCancelRequest={() => {
                        this.setState({ addDialogVisible: false });
                    }}
                    newProjectFormProps={{
                        onCreated: (projectId: string) => {
                            this.props.history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", projectId));
                        }
                    }}
                />
            </>
        );
    }
}

const ProjectsSite: any = withRouter(ProjectsSiteUnwrapped);
export { ProjectsSite };
