import { Card, Layout, Statistic } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { authStore } from "../../stores/AuthStore";

export const AboutSite = observer(() => {
    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <h1>About</h1>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    <Card style={{ marginBottom: 40, marginRight: 40 }}>
                        <Statistic title="Texterify Version" value={authStore.version} />
                    </Card>
                </div>
            </Layout.Content>
        </Layout>
    );
});
