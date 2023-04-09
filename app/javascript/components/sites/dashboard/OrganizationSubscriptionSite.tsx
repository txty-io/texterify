import { Alert, Button, Card, Layout, message, Skeleton } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ICustomSubscription, ISubscription, OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { MESSAGE_DURATION_IMPORTANT } from "../../configs/MessageDurations";
import { Routes } from "../../routing/Routes";
import { subscriptionService } from "../../services/SubscriptionService";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore } from "../../stores/DashboardStore";
import { IPlanIDS } from "../../types/IPlan";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { CustomSubscription } from "../../ui/CustomSubscription";
import { Features } from "../../ui/Features";
import { BASIC_PLAN, BUSINESS_PLAN, Licenses, TEAM_PLAN } from "../../ui/Licenses";
import { Utils } from "../../ui/Utils";
import { CustomAlert } from "../../ui/CustomAlert";

const gridStyle: React.CSSProperties = {
    width: "50%"
};

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    subscription: ISubscription;
    customSubscription: ICustomSubscription;
    loading: boolean;
}

@observer
class OrganizationSubscriptionSite extends React.Component<IProps, IState> {
    state: IState = {
        subscription: null,
        customSubscription: null,
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
        const customSubscription = await subscriptionService.getCustomSubscription(
            this.props.match.params.organizationId
        );
        const getOrganizationResponse = await OrganizationsAPI.getOrganization(this.props.match.params.organizationId);
        if (!getOrganizationResponse.errors) {
            dashboardStore.currentOrganization = getOrganizationResponse.data;
        }
        this.setState({
            subscription: subscription,
            customSubscription: customSubscription,
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

    async openCustomerPortal() {
        const response = await fetch(
            `${process.env.TEXTERIFY_PAYMENT_SERVER}/portal/${dashboardStore.currentOrganization.id}?return_url=${window.location}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    client: authStore.client,
                    "access-token": authStore.accessToken,
                    uid: authStore.currentUser && authStore.currentUser.email
                }
            }
        );

        const responseJSON = await response.json();
        window.open(responseJSON.portal_url, "_blank");
    }

    renderActivatedUserContent() {
        return (
            <>
                {this.state.customSubscription && (
                    <>
                        <h3>Your active subscription</h3>
                        <CustomSubscription customSubscription={this.state.customSubscription} />
                    </>
                )}

                {!this.state.customSubscription && authStore.redeemableCustomSubscriptions.length > 0 && (
                    <>
                        <h3>Activate a special subscription</h3>
                        <p>
                            You are elligible for one or more special subscriptions that can be activated for this
                            organization. If you activate a special subscription any other subscriptions or trials will
                            be automatically cancelled.
                        </p>
                        {authStore.redeemableCustomSubscriptions.map((customSubscription) => {
                            return (
                                <CustomSubscription
                                    key={customSubscription.id}
                                    customSubscription={customSubscription}
                                    onClick={async () => {
                                        try {
                                            await OrganizationsAPI.activateCustomSubscription({
                                                organizationId: this.props.match.params.organizationId,
                                                customSubscriptionId: customSubscription.id
                                            });
                                            await this.reload();
                                        } catch (error) {
                                            console.error(error);
                                            message.error("Failed to activate subscription.");
                                        }
                                    }}
                                    style={{ marginBottom: 24 }}
                                />
                            );
                        })}
                    </>
                )}

                {!this.state.customSubscription && dashboardStore.currentOrganization.attributes.trial_active && (
                    <>
                        <p>
                            Your trial period ends on:{" "}
                            <span style={{ fontWeight: "bold", marginLeft: 8 }}>
                                {dashboardStore.currentOrganization.attributes.trial_ends_at}
                            </span>
                        </p>
                        {!this.state.subscription && (
                            <CustomAlert
                                description={
                                    <>
                                        Your are currently on the trial period. You can experience all features during
                                        the trial for free. Select a plan that fits your needs to continue using the
                                        premium features after your trial ends. If you have any questions contact us by
                                        sending us an email to{" "}
                                        <a href="mailto:support@texterify.com" target="_blank">
                                            support@texterify.com
                                        </a>
                                        .
                                    </>
                                }
                                type="info"
                                style={{ maxWidth: 560, marginBottom: 24 }}
                            />
                        )}
                    </>
                )}

                {!this.state.customSubscription && this.state.subscription && (
                    <>
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
                                <Button
                                    type="primary"
                                    style={{ marginLeft: 16 }}
                                    onClick={async () => {
                                        await this.openCustomerPortal();
                                    }}
                                >
                                    Open customer portal
                                </Button>
                            </div>
                        )}

                        {this.state.subscription.attributes.canceled && (
                            <div style={{ marginTop: 24 }}>
                                <CustomAlert
                                    description={
                                        <>
                                            You have canceled your subscription and will loose access to the premium
                                            features on{" "}
                                            <span style={{ fontWeight: "bold" }}>
                                                {this.state.subscription.attributes.renews_or_cancels_on}
                                            </span>
                                            .
                                        </>
                                    }
                                    type="error"
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
                                <Button
                                    type="primary"
                                    style={{ marginLeft: 16 }}
                                    onClick={async () => {
                                        await this.openCustomerPortal();
                                    }}
                                >
                                    Open customer portal
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {!this.state.customSubscription && (
                    <div style={{ flexGrow: 1, maxWidth: 1200, marginTop: 24 }}>
                        <Licenses
                            hostingType="cloud"
                            organizationId={this.props.match.params.organizationId}
                            selected={this.state.subscription?.attributes.plan}
                            onChangePlan={async (plan) => {
                                await this.onChangeSubscriptionPlan(plan.id);
                            }}
                        />
                    </div>
                )}
            </>
        );
    }

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="organizationSubscription" />
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Subscription</h1>
                    <p>
                        Manage your subscription for the cloud version of Texterify. <br />
                        If you want to host Texterify in your own infrastructure you can get a license{" "}
                        <Link to={Routes.USER.SETTINGS.LICENSES}>here</Link>.
                    </p>
                    {(!dashboardStore.currentOrganization ||
                        dashboardStore.currentOrganization.attributes.current_user_deactivated) && <Skeleton active />}
                    {dashboardStore.currentOrganization &&
                        !dashboardStore.currentOrganization.attributes.current_user_deactivated &&
                        this.renderActivatedUserContent()}
                </Layout.Content>
            </Layout>
        );
    }
}

export { OrganizationSubscriptionSite };
