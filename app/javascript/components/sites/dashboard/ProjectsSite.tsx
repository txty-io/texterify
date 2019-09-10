import { Button, Empty, Input, Layout, List, message, Pagination } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import styled from "styled-components";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { NewProjectFormModal } from "../../forms/NewProjectFormModal";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { ListContent } from "../../ui/ListContent";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { ProjectAvatar } from "../../ui/ProjectAvatar";
import { ProjectsList } from "../../ui/ProjectsList";
import { Styles } from "../../ui/Styles";
import { makeCancelable } from "../../utilities/Promise";

type IProps = RouteComponentProps & {};
interface IState {
  projectsResponse: any;
  projects: any[];
  addDialogVisible: boolean;
  perPage: number;
  page: number;
  search: string;
}

class ProjectsSiteUnwrapped extends React.Component<IProps, IState> {
  getProjectsPromise: any = null;
  debouncedSearchReloader: any = _.debounce(async (value) => {
    this.setState({ search: value, page: 0 });
    await this.reloadTable({ search: value, page: 0 });
  }, 500, { trailing: true });

  constructor(props: IProps) {
    super(props);

    this.state = {
      projectsResponse: null,
      projects: [],
      addDialogVisible: false,
      perPage: DEFAULT_PAGE_SIZE,
      page: 0,
      search: ""
    };
  }

  async componentDidMount(): Promise<void> {
    await this.fetchProjects();
  }

  componentWillUnmount() {
    if (this.getProjectsPromise !== null) { this.getProjectsPromise.cancel(); }
  }

  fetchProjects = async (options?: any) => {
    try {
      this.getProjectsPromise = makeCancelable(ProjectsAPI.getProjects(options));

      const responseProjects = await this.getProjectsPromise.promise;

      this.setState({
        projectsResponse: responseProjects,
        projects: responseProjects.data
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  reloadTable = async (options?: any) => {
    const fetchOptions = options || {};
    fetchOptions.search = options && options.search || this.state.search;
    fetchOptions.page = options && options.page || this.state.page;
    fetchOptions.perPage = options && options.perPage || this.state.perPage;
    await this.fetchProjects(fetchOptions);
  }

  onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.debouncedSearchReloader(event.target.value);
  }

  render(): JSX.Element {
    return (
      <>
        <Layout style={{ padding: "0 24px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
          <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
            <h1 style={{ flexGrow: 1 }}>Projects</h1>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <div style={{ flexGrow: 1 }}>
                <PrimaryButton onClick={() => { this.setState({ addDialogVisible: true }); }}>
                  Create project
                </PrimaryButton>
              </div>
              <Input.Search
                placeholder="Search projects"
                onChange={this.onSearch}
                style={{ maxWidth: "50%" }}
              />
            </div>

            <ProjectsList projects={this.state.projects || []} />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <Pagination
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                showSizeChanger
                pageSize={this.state.perPage}
                total={(this.state.projectsResponse && this.state.projectsResponse.meta && this.state.projectsResponse.meta.total) || 0}
                onChange={
                  async (page: number, perPage: number) => {
                    this.setState({ page: page });
                    await this.reloadTable({ page: page });
                  }
                }
                onShowSizeChange={
                  async (current: number, size: number) => {
                    this.setState({ perPage: size });
                    await this.reloadTable({ perPage: size });
                  }
                }
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

const ProjectsSite: any = withRouter(ProjectsSiteUnwrapped);
export { ProjectsSite };
