import { LoadingOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Button, InputNumber, Tooltip, Tag, message } from "antd";
import * as React from "react";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { IPlanIDS } from "../types/IPlan";
import { Features } from "./Features";
import styled from "styled-components";

export const FREE_PLAN: IPlan = {
    id: "free",
    name: "Free",
    pricePerUserCloud: 0,
    pricePerUserOnPremise: 0,
    features: ["1 user", "1 project", "2 languages", "Unlimited keys", "Unlimited translations"]
};

export const BASIC_PLAN: IPlan = {
    id: "basic",
    name: "Basic",
    pricePerUserCloud: 9,
    pricePerUserOnPremise: 7,
    features: [
        "Unlimited users",
        "Unlimited projects",
        "Unlimited languages",
        "Unlimited keys",
        "Unlimited translations"
    ]
};

export const TEAM_PLAN: IPlan = {
    id: "team",
    name: "Team",
    pricePerUserCloud: 19,
    pricePerUserOnPremise: 14,
    features: [
        "Unlimited users",
        "Unlimited projects",
        "Unlimited languages",
        "Unlimited keys",
        "Unlimited translations",
        // "Validations",
        "Key history",
        "Export hierarchy",
        "Post processing",
        "Project activity"
        // "Tag management"
    ]
};

export const BUSINESS_PLAN: IPlan = {
    id: "business",
    name: "Business",
    pricePerUserCloud: 39,
    pricePerUserOnPremise: 31,
    features: [
        "Unlimited users",
        "Unlimited projects",
        "Unlimited languages",
        "Unlimited keys",
        "Unlimited translations",
        // "Validations",
        "Key history",
        "Export hierarchy",
        "Post processing",
        "Project activity",
        // "Tag management",
        "OTA",
        "HTML editor"
        // "Templates",
        // "Project groups",
        // "Machine translations"
    ]
};

export function getPlanById(planId: IPlanIDS) {
    if (planId === "free") {
        return FREE_PLAN;
    } else if (planId === "basic") {
        return BASIC_PLAN;
    } else if (planId === "team") {
        return TEAM_PLAN;
    } else if (planId === "business") {
        return BUSINESS_PLAN;
    }
}

interface IPlan {
    id: IPlanIDS;
    name: string;
    pricePerUserCloud: number;
    pricePerUserOnPremise: number;
    features: string[];
}

export type IHostingType = "on-premise" | "cloud";

let stripePromise: Promise<Stripe>;

export const handleCheckout = async (
    plan: IPlan,
    type: IHostingType,
    details: {
        quantity?: number;
        organizationId: string;
        cancelUrl?: string;
        successUrl?: string;
    }
) => {
    try {
        if (process.env.STRIPE_PUBLIC_API_KEY) {
            stripePromise = loadStripe(process.env.STRIPE_PUBLIC_API_KEY);
        }
        const stripe = await stripePromise;

        if (!stripe) {
            console.error("Failed to load stripe.");
            message.error("An error occurred loading our payment service provider.");
            history.push(Routes.ROOT);

            return;
        }

        // Create the checkout session
        const response = await fetch(`${process.env.TEXTERIFY_PAYMENT_SERVER}/subscriptions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                plan: plan.id,
                hosting_type: type,
                quantity: details.quantity,
                user_id: authStore.currentUser.id,
                organization_id: type === "cloud" ? details.organizationId : undefined,
                email: authStore.currentUser.email,
                cancel_url: details.cancelUrl,
                success_url: details.successUrl
            })
        });

        const session = await response.json();

        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer
            // using `result.error.message`.
        }
    } catch (error) {
        console.error(error);
    }
};

const PlanWrapper = styled.div`
    border: 1px solid;
    border-color: ${(props) => {
        return props.selected ? "var(--primary-btn-color)" : "var(--border-color)";
    }};

    &:hover {
        border-color: ${(props) => {
            return props.selected ? "var(--primary-btn-color)" : "var(--border-color-flashier)";
        }};
    }
`;

function PaymentPlan(props: {
    plan: IPlan;
    hostingType: IHostingType;
    selected?: boolean;
    hasActivePlan?: boolean;
    organizationId?: string;
    annualBilling?: boolean;
    style?: React.CSSProperties;
    hideSelectButton?: boolean;
    showFreeTrial?: boolean;
    onClick?(): void;
    onChangePlan?(plan: IPlan): void;
}) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [usersCount, setUsersCount] = React.useState<number>(5);

    const price = props.hostingType === "on-premise" ? props.plan.pricePerUserOnPremise : props.plan.pricePerUserCloud;

    return (
        <PlanWrapper
            style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                flexBasis: "0",
                ...props.style
            }}
            selected={props.selected}
            onClick={props.onClick}
        >
            <div
                style={{
                    padding: 40,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    margin: 0,
                    textAlign: "center"
                }}
            >
                <h2 style={{ fontSize: 24 }}>{props.plan.name}</h2>
                {props.showFreeTrial && (
                    <div style={{ marginBottom: 16 }}>
                        <Tag color="magenta">7 day free trial</Tag>
                    </div>
                )}
                <div style={{ fontSize: 16 }}>
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>{price} €</div>
                    user/month
                </div>

                <div style={{ marginTop: 8, fontWeight: "bold" }}>
                    {props.annualBilling ? `1 year for ${price * 12} €` : "Monthly Billing"}
                </div>
            </div>
            <div
                style={{
                    padding: "0 40px 24px 40px",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4
                }}
            >
                <Features features={props.plan.features} />

                <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", flexDirection: "column" }}>
                    {props.hostingType === "on-premise" && (
                        <>
                            <h3>
                                <span style={{ marginRight: 8 }}>Choose number of users</span>
                                <Tooltip title="The number of users that can use Texterify.">
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </h3>
                            <InputNumber
                                min={1}
                                max={10000}
                                precision={0}
                                defaultValue={usersCount}
                                placeholder="Number of users"
                                onChange={(count: number) => {
                                    setUsersCount(count);
                                }}
                                style={{ width: "100%" }}
                            />
                            <div
                                style={{
                                    marginTop: 24,
                                    display: "flex",
                                    marginBottom: 24,
                                    fontSize: 14,
                                    fontWeight: "bold"
                                }}
                            >
                                <div style={{ marginRight: 24 }}>Total:</div>
                                <div>{!isNaN(Number(usersCount)) ? price * usersCount * 12 : "-"} €</div>
                            </div>
                        </>
                    )}
                    {!props.selected && !props.hideSelectButton && (
                        <Button
                            onClick={async () => {
                                if (props.hasActivePlan) {
                                    props.onChangePlan(props.plan);
                                } else {
                                    setLoading(true);
                                    await handleCheckout(
                                        props.plan,
                                        props.hostingType,
                                        props.hostingType === "on-premise"
                                            ? {
                                                  quantity: usersCount,
                                                  organizationId: props.organizationId
                                              }
                                            : { organizationId: props.organizationId }
                                    );
                                    setLoading(false);
                                }
                            }}
                            style={{ width: "100%" }}
                            disabled={loading}
                            ghost={props.selected}
                            size="large"
                            type={props.selected ? undefined : "primary"}
                        >
                            {!loading && !props.selected && "Select"}
                            {props.selected && "Your plan"}
                            {loading && !props.selected && <LoadingOutlined />}
                        </Button>
                    )}
                </div>
            </div>
        </PlanWrapper>
    );
}

export function Licenses(props: {
    hostingType: IHostingType;
    organizationId?: string;
    selected?: IPlan["id"];
    annualBilling?: boolean;
    hideSelectButtons?: boolean;
    selectByPlanClick?: boolean;
    showFreeTrial?: boolean;
    onChangePlan?(plan: IPlan): void;
}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center"
            }}
        >
            <PaymentPlan
                plan={FREE_PLAN}
                selected={props.selected === FREE_PLAN.id}
                hasActivePlan={!!props.selected}
                hostingType={props.hostingType}
                organizationId={props.organizationId}
                onChangePlan={props.onChangePlan}
                style={{ marginRight: 16, cursor: props.selectByPlanClick ? "pointer" : "default" }}
                annualBilling={props.annualBilling}
                hideSelectButton={props.hideSelectButtons}
                onClick={() => {
                    if (props.selectByPlanClick && props.onChangePlan) {
                        props.onChangePlan(FREE_PLAN);
                    }
                }}
                showFreeTrial={props.showFreeTrial}
            />
            <PaymentPlan
                plan={BASIC_PLAN}
                selected={props.selected === BASIC_PLAN.id}
                hasActivePlan={!!props.selected}
                hostingType={props.hostingType}
                organizationId={props.organizationId}
                onChangePlan={props.onChangePlan}
                style={{ marginRight: 16, cursor: props.selectByPlanClick ? "pointer" : "default" }}
                annualBilling={props.annualBilling}
                hideSelectButton={props.hideSelectButtons}
                onClick={() => {
                    if (props.selectByPlanClick && props.onChangePlan) {
                        props.onChangePlan(BASIC_PLAN);
                    }
                }}
                showFreeTrial={props.showFreeTrial}
            />
            <PaymentPlan
                plan={TEAM_PLAN}
                selected={props.selected === TEAM_PLAN.id}
                hasActivePlan={!!props.selected}
                hostingType={props.hostingType}
                organizationId={props.organizationId}
                onChangePlan={props.onChangePlan}
                style={{ marginRight: 16, cursor: props.selectByPlanClick ? "pointer" : "default" }}
                annualBilling={props.annualBilling}
                hideSelectButton={props.hideSelectButtons}
                onClick={() => {
                    if (props.selectByPlanClick && props.onChangePlan) {
                        props.onChangePlan(TEAM_PLAN);
                    }
                }}
                showFreeTrial={props.showFreeTrial}
            />
            <PaymentPlan
                plan={BUSINESS_PLAN}
                selected={props.selected === BUSINESS_PLAN.id}
                hasActivePlan={!!props.selected}
                hostingType={props.hostingType}
                organizationId={props.organizationId}
                onChangePlan={props.onChangePlan}
                style={{ cursor: props.selectByPlanClick ? "pointer" : "default" }}
                annualBilling={props.annualBilling}
                hideSelectButton={props.hideSelectButtons}
                onClick={() => {
                    if (props.selectByPlanClick && props.onChangePlan) {
                        props.onChangePlan(BUSINESS_PLAN);
                    }
                }}
                showFreeTrial={props.showFreeTrial}
            />
        </div>
    );
}
