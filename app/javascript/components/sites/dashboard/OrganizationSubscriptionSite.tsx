import { Alert, Button, Card, Layout, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { ISubscription, OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { MESSAGE_DURATION_IMPORTANT } from "../../configs/MessageDurations";
import { subscriptionService } from "../../services/SubscriptionService";
import { IPlanIDS } from "../../types/IPlan";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
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
        this.setState({ loading: true });
        const subscription = await subscriptionService.getActiveSubscription(this.props.match.params.organizationId, {
            forceReload: true
        });
        this.setState({
            subscription: subscription,
            loading: false
        });
    }

    getPlanByPlanName(planName: IPlanIDS) {
        if (planName === "basic") {
            return BASIC_PLAN;
        } else if (planName === "team") {
            return TEAM_PLAN;
        } else if (planName === "business") {
            return BUSINESS_PLAN;
        }
    }

    async onCancelSubscription() {
        this.setState({ loading: true });
        await OrganizationsAPI.cancelOrganizationSubscription(this.props.match.params.organizationId);
        await this.reload();
        message.success(
            "Your subscription has been canceled and will end at the end of your subscription period.",
            MESSAGE_DURATION_IMPORTANT
        );
    }

    async onReactivateSubscription() {
        this.setState({ loading: true });
        await OrganizationsAPI.reactivateOrganizationSubscription(this.props.match.params.organizationId);
        await this.reload();
        message.success("Your subscription has been reactivated.", MESSAGE_DURATION_IMPORTANT);
    }

    async onChangeSubscriptionPlan(planID: IPlanIDS) {
        this.setState({ loading: true });
        await OrganizationsAPI.changeOrganizationSubscriptionPlan(this.props.match.params.organizationId, planID);
        await this.reload();
        message.success("Successfully changed subscription plan.", MESSAGE_DURATION_IMPORTANT);
    }

    render() {
        if (this.state.loading) {
            return <Loading />;
        }

        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="organizationSubscription" />
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Subscription</h1>

                    {this.state.subscription && (
                        <Card
                            type="inner"
                            title="Active plan"
                            style={{ marginRight: 40, maxWidth: 880 }}
                            bodyStyle={{ display: "flex" }}
                        >
                            <Card.Grid hoverable={false} style={gridStyle}>
                                <div
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 20
                                    }}
                                >
                                    {Utils.capitalize(this.state.subscription.attributes.plan)} Plan
                                </div>
                                <div style={{ fontSize: 14, marginTop: 8, display: "flex", alignItems: "center" }}>
                                    <div style={{ width: 200 }}>Users:</div>
                                    <div>{this.state.subscription.attributes.users_count}</div>
                                </div>
                                <div style={{ fontSize: 14, marginTop: 8, display: "flex", alignItems: "center" }}>
                                    <div style={{ width: 200 }}>
                                        {this.state.subscription.attributes.canceled
                                            ? "Open bill at end of month"
                                            : "Current monthly bill"}
                                        :
                                    </div>
                                    <div>{this.state.subscription.attributes.invoice_upcoming_total / 100} €</div>
                                </div>
                                <div style={{ fontSize: 14, marginTop: 8, display: "flex", alignItems: "center" }}>
                                    <div style={{ width: 200 }}>
                                        {this.state.subscription.attributes.canceled ? "Ends on" : "Renews on"}:
                                    </div>
                                    <div>{this.state.subscription.attributes.renews_or_cancels_on}</div>
                                </div>
                                {!this.state.subscription.attributes.canceled && (
                                    <div style={{ marginTop: 24 }}>
                                        <Button
                                            danger
                                            onClick={async () => {
                                                await this.onCancelSubscription();
                                            }}
                                        >
                                            Cancel subscription
                                        </Button>
                                    </div>
                                )}

                                {this.state.subscription.attributes.canceled && (
                                    <div style={{ marginTop: 24 }}>
                                        <Alert
                                            showIcon
                                            message={
                                                <>
                                                    You have canceled your subscription and will loose access to the
                                                    premium Texterify features on{" "}
                                                    <span style={{ fontWeight: "bold" }}>
                                                        {this.state.subscription.attributes.renews_or_cancels_on}
                                                    </span>
                                                    . Click the button below to reactivate your subscription.
                                                </>
                                            }
                                            type="warning"
                                        />
                                        <Button
                                            type="primary"
                                            onClick={async () => {
                                                await this.onReactivateSubscription();
                                            }}
                                            style={{ marginTop: 16 }}
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

                    <div style={{ flexGrow: 1, maxWidth: 1000 }}>
                        <h3 style={{ marginTop: 24 }}>
                            {this.state.subscription ? "Change your plan" : "Get a new license"}
                        </h3>
                        <p style={{ maxWidth: 480, marginTop: 16 }}>Select a subscription that fits your needs.</p>
                        <Licenses
                            hostingType="cloud"
                            organizationId={this.props.match.params.organizationId}
                            selected={this.state.subscription?.attributes.plan}
                            onChangePlan={(plan) => {
                                this.onChangeSubscriptionPlan(plan.id);
                            }}
                        />
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export { OrganizationSubscriptionSite };
