import { Button } from "antd";
import { observer } from "mobx-react";
import * as queryString from "query-string";
import * as React from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";

const PaymentSuccessSite = observer(() => {
    const [email, setEmail] = React.useState<string>();

    const history = useHistory();

    React.useEffect(() => {
        const fetchData = async () => {
            const parsed = queryString.parse(history.location.search);
            const response = await fetch(`http://localhost:3001/payments/session?id=${parsed["session-id"]}`, {
                method: "GET"
            });
            const data = await response.json();
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
            <h1>Thank you! You payment was successful.</h1>
            <p style={{ fontWeight: "bold" }}>
                We will send you your license key by email to{" "}
                <span style={{ color: "var(--blue-color)" }}>{email}</span>.
            </p>
            <p style={{ fontSize: 12, maxWidth: 480, textAlign: "center", color: "#aaa" }}>
                If you are having any problems receiving or activating your license you can contact us by emailing{" "}
                <a href="mailto:support@texterify.com" target="_blank">
                    support@texterify.com
                </a>
                .
            </p>
            {authStore.isAuthenticated && (
                <Link to={Routes.DASHBOARD.ROOT}>
                    <Button type="primary">Explore the app</Button>
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
