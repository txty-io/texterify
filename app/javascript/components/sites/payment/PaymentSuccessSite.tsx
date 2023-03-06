import { Button } from "antd";
import { observer } from "mobx-react";
import * as queryString from "query-string";
import * as React from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { IHostingType } from "../../ui/Licenses";

const PaymentSuccessSite = observer(() => {
    const [email, setEmail] = React.useState<string>();
    const [hostingType, setHostingType] = React.useState<IHostingType>();
    const [organizationId, setOrganizationId] = React.useState<string>();

    const history = useHistory();

    React.useEffect(() => {
        const fetchData = async () => {
            const parsed = queryString.parse(history.location.search);
            setHostingType(parsed.type as IHostingType);
            const response = await fetch(
                `${process.env.PAYMENT_SERVER}/subscriptions/session?id=${parsed["session-id"]}`,
                {
                    method: "GET"
                }
            );
            const data = await response.json();
            setOrganizationId(data.organization_id);
            setEmail(data.email);
        };

        fetchData();
    });

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 40
            }}
        >
            <div style={{ fontSize: 64 }}>🎉</div>
            <h1>Thank you! Your payment was successful.</h1>
            {hostingType === "on-premise" && (
                <>
                    <p style={{ fontWeight: "bold" }}>
                        We will send you your license key by email to{" "}
                        <span style={{ color: "var(--color-primary)" }}>{email}</span>.
                    </p>
                    <p style={{ fontSize: 12, maxWidth: 480, textAlign: "center", color: "#aaa" }}>
                        If you are having any problems receiving or activating your license you can contact us by
                        emailing{" "}
                        <a href="mailto:support@txty.io" target="_blank">
                            support@txty.io
                        </a>
                        .
                    </p>
                </>
            )}
            {hostingType === "cloud" && (
                <p style={{ fontSize: 12, maxWidth: 480, textAlign: "center", color: "#aaa" }}>
                    If you are having any problems or questions you can contact us by emailing{" "}
                    <a href="mailto:support@txty.io" target="_blank">
                        support@txty.io
                    </a>
                    .
                </p>
            )}
            {authStore.isAuthenticated && (
                <Link
                    to={
                        hostingType === "cloud"
                            ? Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION.replace(":organizationId", organizationId)
                            : Routes.USER.SETTINGS.LICENSES
                    }
                >
                    <Button type="primary">{hostingType === "cloud" ? "Go to subscription" : "Go to licenses"}</Button>
                </Link>
            )}
            {!authStore.isAuthenticated && (
                <Link to={Routes.AUTH.LOGIN}>
                    <Button type="primary">Login</Button>
                </Link>
            )}
        </div>
    );
});

export { PaymentSuccessSite };
