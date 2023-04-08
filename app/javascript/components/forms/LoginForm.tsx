import { Button, Form, Input } from "antd";
import axios from "axios";
import * as React from "react";
import { t } from "../i18n/Util";
import { ILoginErrorResponse, useLogin } from "../network/useLogin";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { CustomAlert } from "../ui/CustomAlert";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { SiteWrapperLink } from "../ui/SiteWrapperLink";

interface IFormValues {
    email: string;
    password: string;
}

export function LoginForm() {
    const loginMutation = useLogin();

    const [loginErrorMessages, setLoginErrorMessages] = React.useState<string[]>([]);

    const handleSubmit = async (values: IFormValues) => {
        try {
            const response = await loginMutation.mutateAsync({ email: values.email, password: values.password });

            authStore.currentUser = response.data.data;
        } catch (err) {
            authStore.resetAuth();
            if (axios.isAxiosError(err)) {
                const errorResponse: ILoginErrorResponse = err.response?.data;
                let errors = errorResponse.errors || [t("network.error.general")];

                if (errorResponse.error_type === "USER_IS_DEACTIVATED") {
                    errors = [t("component.login_form.error.user_is_deactivated")];
                }

                setLoginErrorMessages(errors);
            }
        }
    };

    return (
        <>
            <LoadingOverlay isVisible={loginMutation.isLoading} loadingText={t("component.login_form.loading")} />
            <Form onFinish={handleSubmit}>
                {loginErrorMessages.length > 0 && (
                    <>
                        <CustomAlert description={loginErrorMessages} type="error" style={{ marginBottom: 24 }} />
                    </>
                )}

                <h3>{t("component.login_form.email.label")}</h3>
                <Form.Item
                    name="email"
                    rules={[{ required: true, whitespace: true, message: t("component.login_form.email.required") }]}
                >
                    <Input
                        tabIndex={1}
                        placeholder={t("component.login_form.email.placeholder")}
                        autoComplete="email"
                    />
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>{t("component.login_form.password.label")}</h3>
                    <SiteWrapperLink to={Routes.AUTH.FORGOTT_PASSWORD}>Forgot password?</SiteWrapperLink>
                </div>
                <Form.Item
                    name="password"
                    rules={[{ required: true, whitespace: true, message: t("component.login_form.password.required") }]}
                >
                    <Input
                        tabIndex={2}
                        type="password"
                        placeholder={t("component.login_form.password.placeholder")}
                        autoComplete="current-password"
                    />
                </Form.Item>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 8
                    }}
                >
                    <SiteWrapperLink data-id="sign-up-link" to={Routes.AUTH.SIGNUP}>
                        {t("component.login_form.button.signup")}
                    </SiteWrapperLink>
                    <Button tabIndex={3} type="primary" htmlType="submit" style={{ marginBottom: 0 }}>
                        {t("component.login_form.button.login")}
                    </Button>
                </div>
            </Form>
        </>
    );
}
