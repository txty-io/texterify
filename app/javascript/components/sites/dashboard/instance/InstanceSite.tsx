import { DeploymentUnitOutlined, ProjectOutlined, TeamOutlined } from "@ant-design/icons";
import { Card, Layout } from "antd";
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
                    <Card style={{ width: 302, marginRight: 40 }}>
                        <h3>
                            <TeamOutlined style={{ marginRight: 8 }} /> Users
                        </h3>
                        <ValueWrapper>{instanceInfo?.users_count}</ValueWrapper>
                    </Card>
                    <Card style={{ width: 300, marginRight: 40 }}>
                        <h3>
                            <ProjectOutlined style={{ marginRight: 8 }} /> Projects
                        </h3>
                        <ValueWrapper>{instanceInfo?.projects_count}</ValueWrapper>
                    </Card>
                    <Card style={{ width: 300 }}>
                        <h3>
                            <DeploymentUnitOutlined style={{ marginRight: 8 }} /> Organizations
                        </h3>
                        <ValueWrapper>{instanceInfo?.organizations_count}</ValueWrapper>
                    </Card>
                </div>
            </Layout.Content>
        </Layout>
    );
});
