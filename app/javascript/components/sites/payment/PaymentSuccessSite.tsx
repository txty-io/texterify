import * as React from "react";
import { Button } from "antd";
import { authStore } from "../../stores/AuthStore";
import { observer } from "mobx-react";
import { Routes } from "../../routing/Routes";
import { Link } from "react-router-dom";

const PaymentSuccessSite = observer(() => {
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
                <span style={{ color: "var(--blue-color)" }}>example@email.com</span>.
            </p>
            <p style={{ fontSize: 12, maxWidth: 480, textAlign: "center", color: "#aaa" }}>
                If you are you are having any problems receiving or activating your license you can contact us by
                emailing{" "}
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
