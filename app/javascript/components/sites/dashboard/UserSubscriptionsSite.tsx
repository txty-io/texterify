import { Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";

@observer
class UserSubscriptionsSite extends React.Component {
    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Subscriptions</h1>
                </Layout.Content>
            </Layout>
        );
    }
}

export { UserSubscriptionsSite };
