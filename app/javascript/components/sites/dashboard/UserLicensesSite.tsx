import { CheckCircleFilled } from "@ant-design/icons";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Card, Layout, Statistic } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { IUserLicense, UserLicensesAPI } from "../../api/v1/UserLicensesAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { Loading } from "../../ui/Loading";

interface IPlan {
    id: string;
    name: string;
    pricePerUserCloud: number;
    pricePerUserOnPremise: number;
    features: string[];
}

const A_PLAN: IPlan = {
    id: "A",
    name: "Basic",
    pricePerUserCloud: 9,
    pricePerUserOnPremise: 0,
    features: [
        "Unlimited projects",
        "Unlimited keys",
        "Unlimited translations",
        "Unlimited languages",
        "Basic permission system"
    ]
};

const B_PLAN: IPlan = {
    id: "B",
    name: "Gold",
    pricePerUserCloud: 19,
    pricePerUserOnPremise: 14,
    features: ["Validations", "History", "Export hierarchy", "Post processing", "Activity overview", "Tag management"]
};

const C_PLAN: IPlan = {
    id: "C",
    name: "Premium",
    pricePerUserCloud: 39,
    pricePerUserOnPremise: 31,
    features: [
        "Advanced permission system",
        "OTA",
        "HTML editor",
        "Templates",
        "Project groups",
        "Machine translations"
    ]
};

let stripePromise: Promise<Stripe>;

const handleCheckout = async (plan: IPlan) => {
    if (process.env.STRIPE_PUBLIC_API_KEY) {
        stripePromise = loadStripe(process.env.STRIPE_PUBLIC_API_KEY);
    }

    const stripe = await stripePromise;

    if (!stripe) {
        console.error("Failed to load stripe.");
        history.push(Routes.OTHER.ROOT);

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
            hosting_type: "on-premise",
            quantity: 3,
            user_id: authStore.currentUser.id,
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
};

function PaymentPlan(props: { plan: IPlan; style?: React.CSSProperties }) {
    const [loading, setLoading] = React.useState<boolean>(false);

    return (
        <div
            style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-color)",
                background: "#fff",
                borderRadius: 4,
                flexBasis: "0",
                color: "#333",
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
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>{props.plan.pricePerUserOnPremise} €</div>
                    user/month
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
                <ul style={{ marginBottom: 24, listStyleType: "none", padding: 0 }}>
                    {props.plan.features.map((feature) => {
                        return (
                            <li key={feature}>
                                <CheckCircleFilled
                                    style={{
                                        color: "#25b546",
                                        marginRight: 16,
                                        marginBottom: 8
                                    }}
                                />
                                {feature}
                            </li>
                        );
                    })}
                </ul>
                <div style={{ marginTop: "auto", paddingTop: 16, display: "flex" }}>
                    <button
                        onClick={() => {
                            setLoading(true);
                            handleCheckout(props.plan);
                        }}
                        style={{ width: "100%" }}
                        className="button button-big"
                    >
                        Select
                    </button>
                </div>
            </div>
        </div>
    );
}

export const UserLicensesSite = observer(() => {
    const [userLicenses, setUserLicenses] = React.useState<IUserLicense[]>();
    const [loading, setLoading] = React.useState<boolean>(true);

    async function loadUserLicenses() {
        try {
            const getUserLicensesResponse = await UserLicensesAPI.getLicenses();
            setUserLicenses(getUserLicensesResponse.data);
        } catch (e) {
            console.error(e);
        }
    }

    async function onInit() {
        setLoading(true);
        await loadUserLicenses();
        setLoading(false);
    }

    React.useEffect(() => {
        onInit();
    }, []);

    function renderLicense(options: { license: IUserLicense; disabled?: boolean; isLast?: boolean }) {
        return (
            <Card
                key={options.license.id}
                style={{ display: "flex", flexDirection: "column", marginBottom: options.isLast ? 0 : 8 }}
            >
                <div style={{ display: "flex" }}>
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="E-Mail"
                        value={options.license.attributes.licensee.email}
                    />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="Starts at"
                        value={options.license.attributes.starts_at}
                    />
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="Expires at"
                        value={options.license.attributes.expires_at}
                    />
                    <Statistic
                        className={options.disabled ? "disabled" : undefined}
                        title="Max active users"
                        value={options.license.attributes.restrictions.active_users_count}
                    />
                </div>
            </Card>
        );
    }

    if (loading) {
        return <Loading />;
    }

    return (
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
            <Layout.Content style={{ margin: "24px 16px 0" }}>
                <h1>Licenses</h1>
                <p style={{ maxWidth: 480, marginTop: 16 }}>
                    Setup Texterify in your own infrastructure. Make sure that your data never leaves your area of
                    control. Requires technical experience for installation.
                </p>

                <div style={{ display: "flex" }}>
                    {userLicenses?.length > 0 && (
                        <div style={{ width: 600, marginRight: 40 }}>
                            <h3 style={{ marginTop: 24 }}>Your licenses</h3>
                            {userLicenses.map((license, index) => {
                                const isLast = index === userLicenses.length - 1;

                                return renderLicense({ license: license, isLast: isLast });
                            })}
                        </div>
                    )}

                    <div style={{ flexGrow: 1, maxWidth: 1000 }}>
                        <h3 style={{ marginTop: 24 }}>Get a new license</h3>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            <PaymentPlan plan={A_PLAN} />
                            <PaymentPlan plan={B_PLAN} style={{ margin: "0 16px" }} />
                            <PaymentPlan plan={C_PLAN} />
                        </div>
                    </div>
                </div>
            </Layout.Content>
        </Layout>
    );
});
