import { ArrowRightOutlined, DeploymentUnitOutlined, ProjectOutlined, TeamOutlined } from "@ant-design/icons";
import { Card, Layout, Statistic } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { IInstanceInfo, InstanceAPI } from "../../../api/v1/InstanceAPI";
import { Loading } from "../../../ui/Loading";

export const InstanceSite = observer(() => {
    const [instanceInfos, setInstanceInfos] = React.useState<IInstanceInfo>();
    const [loading, setLoading] = React.useState<boolean>(true);

    async function loadInstance() {
        try {
            const infos = await InstanceAPI.getInstanceInfos();
            setInstanceInfos(infos);
        } catch (e) {
            console.error(e);
        }
    }

    async function onInit() {
        setLoading(true);
        await loadInstance();
        setLoading(false);
    }

    React.useEffect(() => {
        onInit();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <h1>Instance overview</h1>
                <div style={{ display: "flex" }}>
                    <Card style={{ width: 240, marginRight: 40 }}>
                        <Statistic title="Users" value={instanceInfos?.users_count} prefix={<TeamOutlined />} />
                    </Card>
                    <Card style={{ width: 240, marginRight: 40 }}>
                        <Statistic
                            title="Projects"
                            value={instanceInfos?.projects_count}
                            prefix={<ProjectOutlined />}
                        />
                    </Card>
                    <Card style={{ width: 240 }}>
                        <Statistic
                            title="Organizations"
                            value={instanceInfos?.organizations_count}
                            prefix={<DeploymentUnitOutlined />}
                        />
                    </Card>
                </div>

                <h3 style={{ marginTop: 40 }}>Application status</h3>
                <ul>
                    <Link to="/sidekiq" target="_blank">
                        View background jobs <ArrowRightOutlined />
                    </Link>
                </ul>
            </Layout.Content>
        </Layout>
    );
});
