import { Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Activity } from "../../ui/Activity";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
const { Content } = Layout;

type IProps = RouteComponentProps<{ projectId: string }> & {};
type IState = {
  projectActivityResponse: any;
};

@observer
class ProjectActivitySite extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      projectActivityResponse: null
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      const projectActivityResponse = await ProjectsAPI.getActivity({
        projectId: this.props.match.params.projectId,
        limit: 20
      });

      this.setState({
        projectActivityResponse: projectActivityResponse
      });
    } catch (err) {
      console.error(err);
    }
  }

  render(): JSX.Element {
    if (!this.state.projectActivityResponse) {
      return <Loading />;
    }

    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
        <Breadcrumbs breadcrumbName="projectActivity" />
        <Content style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}>
          <h1>Activity</h1>
          <Activity activitiesResponse={this.state.projectActivityResponse} showTimeAgo />
        </Content>
      </Layout>
    );
  }
}

export { ProjectActivitySite };
