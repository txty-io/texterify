import { Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { InstanceUsersTable } from "../../../ui/InstanceUsersTable";

export const InstanceUsersSite = observer(() => {
    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                <h1>Instance users</h1>

                <InstanceUsersTable />
            </Layout.Content>
        </Layout>
    );
});
