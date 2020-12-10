import { Card, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Features } from "../../ui/Features";
import { Licenses, A_PLAN } from "../../ui/Licenses";

const gridStyle: React.CSSProperties = {
    width: "50%"
};

type IProps = RouteComponentProps<{ organizationId: string }>;

@observer
class OrganizationSubscriptionSite extends React.Component<IProps> {
    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Subscription</h1>

                    <Card
                        type="inner"
                        title="Active plan"
                        headStyle={{ borderBottom: "none22" }}
                        style={{ marginRight: 40, width: 600 }}
                    >
                        <Card.Grid hoverable={false} style={gridStyle}>
                            <div
                                style={{
                                    padding: "8px 20px",
                                    background: "rgb(0 0 0)",
                                    color: "rgb(255, 255, 255)",
                                    display: "inline-block",
                                    borderRadius: "4px",
                                    fontWeight: "bold"
                                }}
                            >
                                Premium
                            </div>
                        </Card.Grid>
                        <Card.Grid hoverable={false} style={gridStyle}>
                            <Features features={A_PLAN.features} />
                        </Card.Grid>
                    </Card>

                    <div style={{ flexGrow: 1, maxWidth: 1000 }}>
                        <h3 style={{ marginTop: 24 }}>Get a new license</h3>
                        <p style={{ maxWidth: 480, marginTop: 16 }}>Select a subscription that fits your needs.</p>
                        <Licenses hostingType="cloud" organizationId={this.props.match.params.organizationId} />
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export { OrganizationSubscriptionSite };
