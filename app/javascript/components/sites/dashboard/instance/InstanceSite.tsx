import {
    ArrowRightOutlined,
    CloudOutlined,
    DeploymentUnitOutlined,
    GlobalOutlined,
    HomeOutlined,
    KeyOutlined,
    MailOutlined,
    ProjectOutlined,
    RobotOutlined,
    SwapOutlined,
    TeamOutlined
} from "@ant-design/icons";
import { Alert, Card, Layout, Statistic } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { IInstanceInfo, InstanceAPI } from "../../../api/v1/InstanceAPI";
import { IGetMachineTranslationsUsage, MachineTranslationsAPI } from "../../../api/v1/MachineTranslationsAPI";
import { Loading } from "../../../ui/Loading";
import { IS_TEXTERIFY_CLOUD } from "../../../utilities/Env";

export const InstanceSite = observer(() => {
    const [instanceInfos, setInstanceInfos] = React.useState<IInstanceInfo>();
    const [machineTransationsUsage, setMachineTransationsUsage] = React.useState<IGetMachineTranslationsUsage>();
    const [loading, setLoading] = React.useState<boolean>(true);

    async function loadInstance() {
        try {
            const infos = await InstanceAPI.getInstanceInfos();
            setInstanceInfos(infos);

            const usage = await MachineTranslationsAPI.getUsage();
            setMachineTransationsUsage(usage);
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

                <h3 style={{ marginTop: 40 }}>Statistics</h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic title="Users" value={instanceInfos?.users_count} prefix={<TeamOutlined />} />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic
                            title="Projects"
                            value={instanceInfos?.projects_count}
                            prefix={<ProjectOutlined />}
                        />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic
                            title="Organizations"
                            value={instanceInfos?.organizations_count}
                            prefix={<DeploymentUnitOutlined />}
                        />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic
                            title="Languages"
                            value={instanceInfos?.languages_count}
                            prefix={<GlobalOutlined />}
                        />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic title="Keys" value={instanceInfos?.keys_count} prefix={<KeyOutlined />} />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic title="Translations" value={instanceInfos?.translations_count} />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40 }}>
                        <Statistic
                            title="Over the Air Releases"
                            value={instanceInfos?.releases_count}
                            prefix={<SwapOutlined />}
                        />
                    </Card>
                </div>

                <h3 style={{ marginTop: 40 }}>Application status</h3>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Link to="/sidekiq" target="_blank">
                            View background jobs <ArrowRightOutlined />
                        </Link>
                        <Statistic
                            title="Sidekiq processes"
                            value={instanceInfos.sidekiq_processes}
                            style={{ marginTop: 8 }}
                        />
                        {instanceInfos.sidekiq_processes === 0 && (
                            <Alert
                                type="error"
                                message="No Sidekiq processes are running. Some functionality might not work as expected."
                                style={{ marginTop: 16 }}
                            />
                        )}
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic
                            title="Machine Translations Usage"
                            valueRender={() => {
                                return (
                                    <>
                                        <div>
                                            <RobotOutlined style={{ marginRight: 16 }} />
                                            {machineTransationsUsage.character_count}/
                                            {machineTransationsUsage.character_limit}
                                        </div>
                                        <div style={{ marginTop: 4 }}>
                                            <a
                                                href="https://www.deepl.com/pro-account/plan"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontSize: 12 }}
                                            >
                                                DeepL Account <ArrowRightOutlined />
                                            </a>
                                        </div>
                                    </>
                                );
                            }}
                        />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40, marginRight: 40 }}>
                        <Statistic
                            title="Frontend mode"
                            prefix={IS_TEXTERIFY_CLOUD ? <CloudOutlined /> : <HomeOutlined />}
                            valueRender={() => {
                                return IS_TEXTERIFY_CLOUD ? "cloud" : "on-premise";
                            }}
                        />

                        <Statistic
                            title="Backend mode"
                            prefix={instanceInfos.is_cloud ? <CloudOutlined /> : <HomeOutlined />}
                            valueRender={() => {
                                return instanceInfos.is_cloud ? "cloud" : "on-premise";
                            }}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                    <Card style={{ width: 240, marginBottom: 40 }}>
                        <Statistic
                            title="Email confirmation required"
                            prefix={<MailOutlined />}
                            valueRender={() => {
                                return instanceInfos.email_confirmation_required ? "Yes" : "No";
                            }}
                        />
                        <Statistic
                            title="Domain filter"
                            valueRender={() => {
                                return (
                                    instanceInfos.domain_filter || (
                                        <i style={{ color: "var(--color-passive)" }}>no filter</i>
                                    )
                                );
                            }}
                            style={{ marginTop: 8 }}
                        />
                        <Statistic
                            title="Sign up enabled"
                            valueRender={() => {
                                return instanceInfos.sign_up_enabled ? "Yes" : "No";
                            }}
                            style={{ marginTop: 8 }}
                        />
                    </Card>
                </div>
            </Layout.Content>
        </Layout>
    );
});
