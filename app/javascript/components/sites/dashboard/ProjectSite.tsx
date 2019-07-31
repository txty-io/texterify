import { Alert, Button, Layout, Progress } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Activity } from "../../ui/Activity";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Styles } from "../../ui/Styles";
import { TextBadge } from "../../ui/TextBadge";
import { makeCancelable } from "../../utilities/Promise";

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  languagesResponse: any;
  projectActivityResponse: any;
}

@observer
class ProjectSite extends React.Component<IProps, IState> {
  getLanguagesPromise: any = null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      languagesResponse: null,
      projectActivityResponse: null
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      this.getLanguagesPromise = makeCancelable(LanguagesAPI.getLanguages(this.props.match.params.projectId));
      const responseLanguages = await this.getLanguagesPromise.promise;

      const projectActivityResponse = await ProjectsAPI.getActivity({
        projectId: this.props.match.params.projectId
      });

      this.setState({
        languagesResponse: responseLanguages,
        projectActivityResponse: projectActivityResponse
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  componentWillUnmount() {
    if (this.getLanguagesPromise !== null) { this.getLanguagesPromise.cancel(); }
  }

  renderLanguagesProgress = () => {
    const languages = this.state.languagesResponse ? this.state.languagesResponse.data : [];

    return (
      <>
        <h3>Progress</h3>
        {languages.length === 0 && (
          <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
            No languages available.
          </p>
        )}
        {languages.map((language, index) => {
          return (
            <div key={index}>
              <h4 style={{ color: "#a7a7a7", margin: "24px 0 0" }}>{language.attributes.name}</h4>
              <Progress percent={parseFloat(language.attributes.progress.toFixed(2))} />
            </div>
          );
        })}
      </>
    );
  }

  render(): JSX.Element {
    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
        <Breadcrumbs breadcrumbName="project" />
        <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
          <h1 style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            {dashboardStore.currentProject && dashboardStore.currentProject.attributes.name}

            <TextBadge
              text={`Project ID: ${this.props.match.params.projectId}`}
              withCopy={this.props.match.params.projectId}
              style={{ marginLeft: 24 }}
            />
          </h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Button
              type="primary"
              onClick={() => {
                history.push(Routes.DASHBOARD.PROJECT_EDITOR.replace(":projectId", this.props.match.params.projectId));
              }}
            >
              Open translation editor
            </Button>
          </div>
          <p style={{ marginTop: 16 }}>{dashboardStore.currentProject && dashboardStore.currentProject.attributes.description}</p>
          {this.state.languagesResponse && this.state.projectActivityResponse && (
            <>
              {(!this.state.languagesResponse.data || this.state.languagesResponse.data.length === 0) && (
                <>
                  <Alert
                    type="info"
                    showIcon
                    message={<>Welcome to your new project.</>}
                    description={
                      <>
                        <p style={{ color: Styles.COLOR_TEXT_DISABLED }}>
                          As a first step you should <Link to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(":projectId", this.props.match.params.projectId)}>
                            add some languages </Link> to your project.
                          <br />
                          <br />
                          Have fun translating your project. <span style={{ marginLeft: 8 }}>🎉</span>
                        </p>
                      </>
                    }
                  />
                </>
              )}
              <div style={{ display: "flex", marginTop: 40 }}>
                <div style={{ width: "50%", marginRight: 40 }}>
                  {this.renderLanguagesProgress()}
                </div>
                <div style={{ width: "50%", marginLeft: 40 }}>
                  <h3>Activity</h3>
                  <Activity activitiesResponse={this.state.projectActivityResponse} />
                </div>
              </div>
            </>
          )}
        </Layout.Content>
      </Layout>
    );
  }
}

export { ProjectSite };
