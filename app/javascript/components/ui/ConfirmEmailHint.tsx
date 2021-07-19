import { CheckCircleFilled } from "@ant-design/icons";
import * as React from "react";
import { AuthAPI } from "../api/v1/AuthAPI";
import { authStore } from "../stores/AuthStore";
import { TransparentButton } from "./TransparentButton";

export function ConfirmEmailHint() {
    const [emailRequested, setEmailRequested] = React.useState<boolean>(false);

    return (
        <div
            style={{
                padding: "12px 24px",
                background: "var(--primary-btn-color)",
                display: "flex",
                alignItems: "center",
                minHeight: 56,
                color: "#fff"
            }}
        >
            Please confirm your account by clicking on the confirmation button in the email we sent to you.
            {!emailRequested && (
                <TransparentButton
                    type="primary"
                    onClick={async () => {
                        await AuthAPI.resendConfirmationEmail(authStore.currentUser.email);
                        setEmailRequested(true);
                    }}
                    style={{ marginLeft: 24 }}
                >
                    Resend confirmation email
                </TransparentButton>
            )}
            {emailRequested && (
                <span style={{ marginLeft: 24, fontWeight: "bold" }}>
                    <CheckCircleFilled style={{ marginRight: 8, color: "#0bffd2" }} /> We have sent you an email with
                    instructions on how to confirm your account
                </span>
            )}
        </div>
    );
}
