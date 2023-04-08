import { Bars4Icon } from "@heroicons/react/24/outline";
import { Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { t } from "../../i18n/Util";
import { dashboardStore } from "../../stores/DashboardStore";
import { Activity } from "../../ui/Activity";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { Loading } from "../../ui/Loading";
import { SiteHeader } from "../../ui/SiteHeader";
const { Content } = Layout;

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    projectActivityResponse: any;
}

@observer
class ProjectActivitySite extends React.Component<IProps, IState> {
    state: IState = {
        projectActivityResponse: null
    };

    async componentDidMount() {
        if (dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY")) {
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
    }

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="projectActivity" />
                <Content style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}>
                    <SiteHeader icon={<Bars4Icon />} title={t("component.activity_site.title")} />

                    {!dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY") && (
                        <FeatureNotAvailable feature="FEATURE_PROJECT_ACTIVITY" />
                    )}
                    {dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY") && (
                        <Activity activitiesResponse={this.state.projectActivityResponse} />
                    )}
                    {dashboardStore.featureEnabled("FEATURE_PROJECT_ACTIVITY") &&
                        !this.state.projectActivityResponse && <Loading />}
                </Content>
            </Layout>
        );
    }
}

export { ProjectActivitySite };
