import { Card, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { ISubscription } from "../../api/v1/OrganizationsAPI";
import { subscriptionService } from "../../services/SubscriptionService";
import { IPlan } from "../../types/IPlan";
import { Features } from "../../ui/Features";
import { BASIC_PLAN, BUSINESS_PLAN, Licenses, TEAM_PLAN } from "../../ui/Licenses";
import { Loading } from "../../ui/Loading";
import { Utils } from "../../ui/Utils";

const gridStyle: React.CSSProperties = {
    width: "50%"
};

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    subscription: ISubscription;
    loading: boolean;
}

@observer
class OrganizationSubscriptionSite extends React.Component<IProps, IState> {
    state: IState = {
        subscription: null,
        loading: true
    };

    async componentDidMount() {
        const subscription = await subscriptionService.getActiveSubscription(this.props.match.params.organizationId);
        this.setState({
            subscription: subscription,
            loading: false
        });
    }

    getPlanByPlanName(planName: IPlan) {
        if (planName === "basic") {
            return BASIC_PLAN;
        } else if (planName === "team") {
            return TEAM_PLAN;
        } else if (planName === "business") {
            return BUSINESS_PLAN;
        }
    }

    render() {
        if (this.state.loading) {
            return <Loading />;
        }

        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Subscription</h1>

                    {this.state.subscription && (
                        <Card type="inner" title="Active plan" style={{ marginRight: 40, width: 600 }}>
                            <Card.Grid hoverable={false} style={gridStyle}>
                                <div
                                    style={{
                                        color: "var(--dark-color)",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {Utils.capitalize(this.state.subscription.attributes.plan)}
                                </div>
                            </Card.Grid>
                            <Card.Grid hoverable={false} style={gridStyle}>
                                Renews on:{" "}
                                <span style={{ fontWeight: "bold" }}>
                                    {this.state.subscription.attributes.renews_on}
                                </span>
                            </Card.Grid>
                            <Card.Grid hoverable={false} style={gridStyle}>
                                <Features
                                    features={this.getPlanByPlanName(this.state.subscription.attributes.plan).features}
                                />
                            </Card.Grid>
                        </Card>
                    )}

                    {!this.state.subscription && (
                        <div style={{ flexGrow: 1, maxWidth: 1000 }}>
                            <h3 style={{ marginTop: 24 }}>Get a new license</h3>
                            <p style={{ maxWidth: 480, marginTop: 16 }}>Select a subscription that fits your needs.</p>
                            <Licenses hostingType="cloud" organizationId={this.props.match.params.organizationId} />
                        </div>
                    )}
                </Layout.Content>
            </Layout>
        );
    }
}

export { OrganizationSubscriptionSite };
