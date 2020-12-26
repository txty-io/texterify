import { Button, Card, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { ISubscription, OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
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
        await this.reload();
    }

    async reload() {
        this.setState({ loading: false });
        const subscription = await subscriptionService.getActiveSubscription(this.props.match.params.organizationId, {
            forceReload: true
        });
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

    async onCancelSubscription() {
        await OrganizationsAPI.cancelOrganizationSubscription(this.props.match.params.organizationId);
        await this.reload();
    }

    async onReactivateSubscription() {
        await OrganizationsAPI.reactivateOrganizationSubscription(this.props.match.params.organizationId);
        await this.reload();
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
                        <Card
                            type="inner"
                            title="Active plan"
                            style={{ marginRight: 40, width: 600 }}
                            bodyStyle={{ display: "flex" }}
                        >
                            <Card.Grid hoverable={false} style={gridStyle}>
                                <div
                                    style={{
                                        color: "var(--dark-color)",
                                        fontWeight: "bold",
                                        fontSize: 20
                                    }}
                                >
                                    {Utils.capitalize(this.state.subscription.attributes.plan)}
                                </div>
                                <div style={{ fontSize: 16, marginTop: 16 }}>
                                    Users:
                                    <div style={{ fontWeight: "bold" }}>
                                        {this.state.subscription.attributes.users_count}
                                    </div>
                                </div>
                                <div style={{ fontSize: 16, marginTop: 16 }}>
                                    Current monthly bill:
                                    <div style={{ fontWeight: "bold" }}>
                                        {this.state.subscription.attributes.invoice_upcoming_total / 100} €
                                    </div>
                                </div>
                                <div style={{ fontSize: 16, marginTop: 16 }}>
                                    {this.state.subscription.attributes.canceled ? "Ends on" : "Renews on"}:
                                    <div style={{ fontWeight: "bold" }}>
                                        {this.state.subscription.attributes.renews_or_cancels_on}
                                    </div>
                                </div>
                                {!this.state.subscription.attributes.canceled && (
                                    <div style={{ marginTop: 24 }}>
                                        <Button
                                            danger
                                            onClick={async () => {
                                                await this.onCancelSubscription();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}

                                {this.state.subscription.attributes.canceled && (
                                    <div style={{ marginTop: 24 }}>
                                        <Button
                                            onClick={async () => {
                                                await this.onReactivateSubscription();
                                            }}
                                        >
                                            Reactivate
                                        </Button>
                                    </div>
                                )}
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
