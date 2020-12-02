import { DeploymentUnitOutlined, ProjectOutlined, TeamOutlined } from "@ant-design/icons";
import { Card, Layout, Statistic } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import styled from "styled-components";
import { IInstanceInfo, InstanceAPI } from "../../../api/v1/InstanceAPI";

const ValueWrapper = styled.p`
    font-size: 30px;
    color: #000;
`;

export const InstanceSite = observer(() => {
    const [instanceInfo, setInstanceInfo] = React.useState<IInstanceInfo>();

    async function loadInstance() {
        try {
            setInstanceInfo(await InstanceAPI.getInstanceInfos());
        } catch (e) {
            console.error(e);
        }
    }

    React.useEffect(() => {
        loadInstance();
    }, []);

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <h1>Instance overview</h1>
                <div style={{ display: "flex" }}>
                    <Card style={{ width: 240, marginRight: 40 }}>
                        <Statistic title="Users" value={instanceInfo?.users_count} prefix={<TeamOutlined />} />
                    </Card>
                    <Card style={{ width: 240, marginRight: 40 }}>
                        <Statistic title="Projects" value={instanceInfo?.projects_count} prefix={<ProjectOutlined />} />
                    </Card>
                    <Card style={{ width: 240 }}>
                        <Statistic
                            title="Organizations"
                            value={instanceInfo?.organizations_count}
                            prefix={<DeploymentUnitOutlined />}
                        />
                    </Card>
                </div>
            </Layout.Content>
        </Layout>
    );
});
