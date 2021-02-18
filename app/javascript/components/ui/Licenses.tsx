import { LoadingOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Button, InputNumber, Tooltip } from "antd";
import * as React from "react";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { IPlanIDS } from "../types/IPlan";
import { Features } from "./Features";

export const BASIC_PLAN: IPlan = {
    id: "basic",
    name: "Basic",
    pricePerUserCloud: 9,
    pricePerUserOnPremise: 7,
    features: [
        "Unlimited projects",
        "Unlimited keys",
        "Unlimited translations",
        "Unlimited languages",
        "Basic permission system"
    ]
};

export const TEAM_PLAN: IPlan = {
    id: "team",
    name: "Team",
    pricePerUserCloud: 19,
    pricePerUserOnPremise: 14,
    features: [
        "Unlimited projects",
        "Unlimited keys",
        "Unlimited translations",
        "Unlimited languages",
        "Basic permission system",
        "Validations",
        "History",
        "Export hierarchy",
        "Post processing",
        "Activity overview"
        // "Tag management"
    ]
};

export const BUSINESS_PLAN: IPlan = {
    id: "business",
    name: "Business",
    pricePerUserCloud: 39,
    pricePerUserOnPremise: 31,
    features: [
        "Unlimited projects",
        "Unlimited keys",
        "Unlimited translations",
        "Unlimited languages",
        "Basic permission system",
        "Validations",
        "History",
        "Export hierarchy",
        "Post processing",
        "Activity overview",
        // "Tag management",
        // "Advanced permission system",
        "OTA",
        "HTML editor"
        // "Templates",
        // "Project groups",
        // "Machine translations"
    ]
};

interface IPlan {
    id: IPlanIDS;
    name: string;
    pricePerUserCloud: number;
    pricePerUserOnPremise: number;
    features: string[];
}

export type IHostingType = "on-premise" | "cloud";

let stripePromise: Promise<Stripe>;

const handleCheckout = async (
    plan: IPlan,
    type: IHostingType,
    details: {
        quantity?: number;
        organizationId: string;
    }
) => {
    try {
        if (process.env.STRIPE_PUBLIC_API_KEY) {
            stripePromise = loadStripe(process.env.STRIPE_PUBLIC_API_KEY);
        }
        const stripe = await stripePromise;

        if (!stripe) {
            console.error("Failed to load stripe.");
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
                email: authStore.currentUser.email
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

function PaymentPlan(props: {
    plan: IPlan;
    hostingType: IHostingType;
    selected?: boolean;
    hasActivePlan?: boolean;
    organizationId?: string;
    annualBilling?: boolean;
    style?: React.CSSProperties;
    onChangePlan?(plan: IPlan): void;
}) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [usersCount, setUsersCount] = React.useState<number>(5);

    const price = props.hostingType === "on-premise" ? props.plan.pricePerUserOnPremise : props.plan.pricePerUserCloud;

    return (
        <div
            style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-color)",
                borderRadius: 4,
                flexBasis: "0",
                ...props.style
            }}
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
                                onChange={(count) => {
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
                        disabled={loading || props.selected}
                        ghost={props.selected}
                        size="large"
                        type={props.selected ? undefined : "primary"}
                    >
                        {!loading && !props.selected && "Select"}
                        {props.selected && "Your plan"}
                        {loading && !props.selected && <LoadingOutlined />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function Licenses(props: {
    hostingType: IHostingType;
    organizationId?: string;
    selected?: IPlan["id"];
    annualBilling?: boolean;
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
                plan={BASIC_PLAN}
                selected={props.selected === BASIC_PLAN.id}
                hasActivePlan={!!props.selected}
                hostingType={props.hostingType}
                organizationId={props.organizationId}
                onChangePlan={props.onChangePlan}
                annualBilling={props.annualBilling}
            />
            <PaymentPlan
                plan={TEAM_PLAN}
                selected={props.selected === TEAM_PLAN.id}
                hasActivePlan={!!props.selected}
                hostingType={props.hostingType}
                organizationId={props.organizationId}
                onChangePlan={props.onChangePlan}
                style={{ margin: "0 16px" }}
                annualBilling={props.annualBilling}
            />
            <PaymentPlan
                plan={BUSINESS_PLAN}
                selected={props.selected === BUSINESS_PLAN.id}
                hasActivePlan={!!props.selected}
                hostingType={props.hostingType}
                organizationId={props.organizationId}
                onChangePlan={props.onChangePlan}
                annualBilling={props.annualBilling}
            />
        </div>
    );
}
