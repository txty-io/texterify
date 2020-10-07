import { CheckCircleFilled, QuestionCircleFilled } from "@ant-design/icons";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Switch, Tooltip } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";

let stripePromise;
if (process.env.STRIPE_PUBLIC_API_KEY) {
    stripePromise = loadStripe(process.env.STRIPE_PUBLIC_API_KEY);
}

interface IPlan {
    id: "basic" | "gold" | "premium";
    name: string;
    pricePerUserCloud: number;
    pricePerUserSelfManaged: number;
    featuresNote: string;
    features: string[];
}

const BASIC_PLAN: IPlan = {
    id: "basic",
    name: "Basic",
    pricePerUserCloud: 9,
    pricePerUserSelfManaged: 0,
    featuresNote: "Includes",
    features: [
        "Unlimited projects",
        "Unlimited keys",
        "Unlimited translations",
        "Unlimited languages",
        "All export formats",
        "Dark mode",
        "CLI tool",
        "VSC extension",
        "API access"
    ]
};

const GOLD_PLAN: IPlan = {
    id: "gold",
    name: "Gold",
    pricePerUserCloud: 19,
    pricePerUserSelfManaged: 14,
    featuresNote: "Includes all features of Basic +",
    features: [
        "Basic permission system",
        "Validations",
        "History",
        "HTML editor",
        "Activity overview",
        "Next business day support"
    ]
};

const PREMIUM_PLAN: IPlan = {
    id: "premium",
    name: "Premium",
    pricePerUserCloud: 39,
    pricePerUserSelfManaged: 31,
    featuresNote: "Includes all features of Gold +",
    features: [
        "Fine grained permission system",
        "OTA",
        "Project and export config templates",
        "Project groups",
        "Machine translations",
        "Post processing",
        "Export hierarchy",
        "Tag management",
        "Priority support"
    ]
};

const handleCheckout = async (plan: IPlan) => {
    // Get Stripe.js instance
    const stripe = await stripePromise;

    // Call your backend to create the Checkout Session
    const response = await fetch("http://localhost:3001/payments", {
        method: "POST",
        body: JSON.stringify({ plan: plan.name })
    });

    const session = await response.json();

    // When the customer clicks on the button, redirect them to Checkout.
    const result = await stripe.redirectToCheckout({
        sessionId: session.id
    });

    if (result.error) {
        // If `redirectToCheckout` fails due to a browser or network
        // error, display the localized error message to your customer
        // using `result.error.message`.
    }
};

function PaymentPlan(props: { plan: IPlan; hostingType: "cloud" | "self-managed"; style?: React.CSSProperties }) {
    const [loading, setLoading] = React.useState<boolean>(false);

    return (
        <div
            style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
                margin: "0 16px",
                boxShadow: "0 0 24px rgb(0, 0, 0, .2)",
                ...props.style
            }}
        >
            <div
                style={{
                    padding: 40,
                    background: "var(--background-color)",
                    color: "#fff",
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    margin: 0,
                    textAlign: "center"
                }}
            >
                <div style={{ fontSize: 24 }}>{props.plan.name}</div>
                <div style={{ color: "#ccc" }}>{props.hostingType === "cloud" ? "cloud" : "self-managed"}</div>
                <div style={{ fontSize: 16, marginTop: 16 }}>
                    {props.hostingType === "cloud" ? props.plan.pricePerUserCloud : props.plan.pricePerUserSelfManaged}{" "}
                    € per user/month
                </div>
            </div>
            <div
                style={{
                    padding: "24px 40px",
                    background: "#fff",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4
                }}
            >
                <p style={{ fontWeight: "bold" }}>{props.plan.featuresNote}</p>
                <ul style={{ marginBottom: 24 }}>
                    {props.plan.features.map((feature) => {
                        return (
                            <li key={feature}>
                                <CheckCircleFilled style={{ color: "#25b546", marginRight: 8, marginBottom: 4 }} />
                                {feature}
                            </li>
                        );
                    })}
                </ul>
                <Button
                    role="link"
                    onClick={() => {
                        setLoading(true);
                        handleCheckout(props.plan);
                    }}
                    loading={loading}
                    style={{
                        marginTop: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 4,
                        padding: 24
                    }}
                    type="primary"
                >
                    Select
                </Button>
            </div>
        </div>
    );
}

const NewPaymentSite = observer(() => {
    const [hostingType, setHostingType] = React.useState<"cloud" | "self-managed">("cloud");

    if (!stripePromise) {
        console.error("Payment is not initialized.");
        history.push(Routes.AUTH.LOGIN);
        return;
    }

    return (
        <div
            style={{
                background: "#fff",
                color: "#333"
            }}
        >
            <div
                style={{ background: "var(--background-color)", position: "absolute", height: 395, width: "100%" }}
            ></div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 40px 56px",
                    position: "relative"
                }}
            >
                <h1 style={{ fontSize: 36, color: "#fff", textAlign: "center" }}>Plans made for you and your team</h1>
                <p style={{ color: "#fff", marginBottom: 80 }}>All plans come with unlimited words.</p>
                <div style={{ width: "100%", maxWidth: 1200 }}>
                    <div style={{ marginBottom: 24, display: "flex", padding: "0 16px" }}>
                        <span
                            onClick={() => {
                                setHostingType("cloud");
                            }}
                            style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                                color: hostingType === "cloud" ? "#fff" : "#ccc"
                            }}
                        >
                            Texterify Cloud
                            <Tooltip title="Use Texterify in the cloud managed by the people who made it. Don't worry about installation, updates, backups and servers.">
                                <QuestionCircleFilled style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </span>
                        <Switch
                            style={{ margin: "0 16px" }}
                            checked={hostingType === "self-managed"}
                            onChange={() => {
                                setHostingType(hostingType === "cloud" ? "self-managed" : "cloud");
                            }}
                        />
                        <span
                            onClick={() => {
                                setHostingType("self-managed");
                            }}
                            style={{
                                cursor: "pointer",
                                fontWeight: "bold",
                                color: hostingType === "self-managed" ? "#fff" : "#ccc"
                            }}
                        >
                            Texterify Self-Managed
                            <Tooltip title="Install Texterify on your own infrastructure. Requires technical experience for installation.">
                                <QuestionCircleFilled style={{ marginLeft: 8 }} />
                            </Tooltip>
                        </span>
                    </div>

                    <div style={{ display: "flex" }}>
                        <PaymentPlan plan={BASIC_PLAN} hostingType={hostingType} />
                        <PaymentPlan plan={GOLD_PLAN} hostingType={hostingType} />
                        <PaymentPlan plan={PREMIUM_PLAN} hostingType={hostingType} />
                    </div>
                </div>
            </div>
        </div>
    );
});

export { NewPaymentSite };
