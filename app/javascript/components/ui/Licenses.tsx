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
import { generalStore } from "../stores/GeneralStore";

export interface IFeature {
    name: string;
    values: (string | number | boolean)[];
}

const FEATURES_MAPPING: IFeature[] = [
    {
        name: "Users",
        values: [1, 5, 10, "Unlimited"]
    },
    {
        name: "Projects",
        values: [1, 2, 5, "Unlimited"]
    },
    {
        name: "Keys",
        values: [250, 1000, 2500, "Unlimited"]
    },
    {
        name: "Languages",
        values: [2, 3, 5, "Unlimited"]
    },
    {
        name: "Collaborative online editor",
        values: [true, true, true, true]
    },
    {
        name: "White-label support",
        values: [true, true, true, true]
    },
    {
        name: "Dark mode",
        values: [true, true, true, true]
    },
    {
        name: "Tags",
        values: [true, true, true, true]
    },
    {
        name: "API/CLI",
        values: [true, true, true, true]
    },
    {
        name: "Permission and role management",
        values: [false, true, true, true]
    },
    {
        name: "Validations",
        values: [false, false, true, true]
    },
    {
        name: "Project activity",
        values: [false, false, true, true]
    },
    {
        name: "Translation suggestions",
        values: [false, false, true, true]
    },
    {
        name: "Language fallbacks",
        values: [false, false, true, true]
    },
    {
        name: "Key history",
        values: [false, false, true, true]
    },
    {
        name: "Post processing",
        values: [false, false, true, true]
    },
    {
        name: "HTML editor",
        values: [false, false, false, true]
    },
    {
        name: "Over the Air translations",
        values: [false, false, false, true]
    },
    {
        name: "Machine translation",
        values: [false, false, false, true]
    }
];

export const FREE_PLAN_FEATURE_INDEX = 1;
export const FREE_PLAN: IPlan = {
    id: "free",
    name: "Free",
    featureIndex: FREE_PLAN_FEATURE_INDEX,
    pricePerMonthCloud: 0,
    pricePerMonthOnPremise: 0,
    pricePerUserCloud: 0,
    pricePerUserOnPremise: 0,
    features: FEATURES_MAPPING.filter((f) => {
        return f.values[FREE_PLAN_FEATURE_INDEX] !== false;
    })
};

export const BASIC_PLAN_FEATURE_INDEX = 1;
export const BASIC_PLAN: IPlan = {
    id: "basic",
    name: "Basic",
    featureIndex: BASIC_PLAN_FEATURE_INDEX,
    pricePerMonthCloud: 19,
    pricePerMonthOnPremise: 17,
    pricePerUserCloud: 9,
    pricePerUserOnPremise: 7,
    features: FEATURES_MAPPING.filter((f) => {
        return f.values[BASIC_PLAN_FEATURE_INDEX] !== false;
    })
};

export const TEAM_PLAN_FEATURE_INDEX = 2;
export const TEAM_PLAN: IPlan = {
    id: "team",
    name: "Team",
    featureIndex: TEAM_PLAN_FEATURE_INDEX,
    pricePerMonthCloud: 29,
    pricePerMonthOnPremise: 24,
    pricePerUserCloud: 19,
    pricePerUserOnPremise: 14,
    features: FEATURES_MAPPING.filter((f) => {
        return f.values[TEAM_PLAN_FEATURE_INDEX] !== false;
    })
};

export const BUSINESS_PLAN_FEATURE_INDEX = 3;
export const BUSINESS_PLAN: IPlan = {
    id: "business",
    name: "Business",
    featureIndex: BUSINESS_PLAN_FEATURE_INDEX,
    pricePerMonthCloud: 49,
    pricePerMonthOnPremise: 42,
    pricePerUserCloud: 39,
    pricePerUserOnPremise: 31,
    features: FEATURES_MAPPING.filter((f) => {
        return f.values[BUSINESS_PLAN_FEATURE_INDEX] !== false;
    })
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
    featureIndex: number;
    pricePerMonthCloud: number;
    pricePerMonthOnPremise: number;
    pricePerUserCloud: number;
    pricePerUserOnPremise: number;
    features: IFeature[];
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
    border: ${(props) => {
        return props.highlighted && generalStore.theme !== "dark" ? "none" : "1px solid";
    }};
    border-color: ${(props) => {
        return props.selected
            ? generalStore.theme === "dark"
                ? "var(--primary-btn-color)"
                : "#000"
            : "var(--border-color)";
    }};
    color: ${(props) => {
        return props.highlighted ? "#fff" : undefined;
    }};
    background: ${(props) => {
        return props.highlighted ? "var(--dark-color)" : undefined;
    }};
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
    highlighted?: boolean;
    onClick?(): void;
    onChangePlan?(plan: IPlan): Promise<void>;
}) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const [usersCount, setUsersCount] = React.useState<number>(5);

    const price =
        props.hostingType === "on-premise" ? props.plan.pricePerMonthOnPremise : props.plan.pricePerMonthCloud;

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
            highlighted={props.highlighted}
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
                <h2 style={{ fontSize: 24, fontWeight: 400, color: "inherit" }}>{props.plan.name}</h2>
                {props.showFreeTrial && (
                    <div style={{ marginBottom: 16 }}>
                        <Tag color="magenta">7 day free trial</Tag>
                    </div>
                )}

                <div style={{ fontSize: 32, fontWeight: "bold" }}>{price} €</div>

                <div style={{ marginTop: 8 }}>{props.annualBilling ? `1 year for ${price * 12} €` : "per month"}</div>
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
                <Features
                    features={props.plan.features}
                    featureIndex={props.plan.featureIndex}
                    highlighted={props.highlighted}
                />

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
                    {!props.hideSelectButton && (
                        <Button
                            onClick={async () => {
                                setLoading(true);
                                if (props.hasActivePlan) {
                                    await props.onChangePlan?.(props.plan);
                                } else {
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
                                }
                                setLoading(false);
                            }}
                            style={{
                                width: "100%",
                                color: props.highlighted && props.selected ? "#d9d9d9" : undefined
                            }}
                            disabled={loading || props.selected}
                            ghost={props.selected}
                            size="large"
                            type={props.selected ? undefined : "primary"}
                            loading={loading}
                        >
                            {!loading && !props.selected && "Select"}
                            {props.selected && "Your plan"}
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
    showFreePlan?: boolean;
    showFreeTrial?: boolean;
    onChangePlan?(plan: IPlan): Promise<void>;
}) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center"
            }}
        >
            {props.showFreePlan && (
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
            )}
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
                highlighted
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
