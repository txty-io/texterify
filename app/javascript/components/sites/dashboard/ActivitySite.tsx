import { Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { DashboardAPI } from "../../api/v1/DashboardAPI";
import { Activity } from "../../ui/Activity";
import { Loading } from "../../ui/Loading";
const { Content } = Layout;

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    dashboardActivityResponse: any;
}

@observer
class ActivitySite extends React.Component<IProps, IState> {
    state: IState = {
        dashboardActivityResponse: null
    };

    async componentDidMount() {
        try {
            const dashboardActivityResponse = await DashboardAPI.getActivity({ limit: 20 });

            this.setState({
                dashboardActivityResponse: dashboardActivityResponse
            });
        } catch (err) {
            console.error(err);
        }
    }

    render() {
        if (!this.state.dashboardActivityResponse) {
            return <Loading />;
        }

        return (
            <Layout style={{ padding: "0 24px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
                <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Activity</h1>
                    <Activity
                        hideTime
                        activitiesResponse={this.state.dashboardActivityResponse}
                        showTimeAgo
                        includeProjectLink
                    />
                </Content>
            </Layout>
        );
    }
}

export { ActivitySite };
