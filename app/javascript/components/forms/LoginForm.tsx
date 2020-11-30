import { Alert, Button, Form, Input } from "antd";
import * as React from "react";
import { AuthAPI, ILoginResponse } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { SiteWrapperLink } from "../ui/SiteWrapperLink";

interface IState {
    isLoading: boolean;
    loginErrors: string[];
}

interface IFormValues {
    email: string;
    password: string;
}

class LoginForm extends React.Component<{}, IState> {
    state: IState = {
        isLoading: false,
        loginErrors: []
    };

    render() {
        return (
            <>
                <LoadingOverlay isVisible={this.state.isLoading} loadingText="We are logging you in..." />
                <Form onFinish={this.handleSubmit}>
                    {this.state.loginErrors.length > 0 && (
                        <Alert
                            showIcon
                            message={this.state.loginErrors.join()}
                            type="error"
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <h3>Email</h3>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, whitespace: true, message: "Please enter your email address." }]}
                    >
                        <Input tabIndex={1} placeholder="Email address" autoComplete="email" />
                    </Form.Item>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3>Password</h3>
                        <SiteWrapperLink to={Routes.AUTH.FORGOTT_PASSWORD}>Forgot password?</SiteWrapperLink>
                    </div>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, whitespace: true, message: "Please enter your password." }]}
                    >
                        <Input tabIndex={2} type="password" placeholder="Password" autoComplete="current-password" />
                    </Form.Item>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: 8
                        }}
                    >
                        <SiteWrapperLink to={Routes.AUTH.SIGNUP} style={{ fontWeight: 600 }}>
                            Create new account
                        </SiteWrapperLink>
                        <Button tabIndex={3} type="primary" htmlType="submit" style={{ marginBottom: 0 }}>
                            Log in
                        </Button>
                    </div>
                </Form>
            </>
        );
    }

    handleSubmit = async (values: IFormValues) => {
        this.setState({ loginErrors: [] });
        const start: number = new Date().getTime();
        this.setState({ isLoading: true });

        let response: ILoginResponse;

        try {
            response = await AuthAPI.login(values.email, values.password);
        } catch (e) {
            authStore.resetAuth();
            this.setState({
                loginErrors: ["An unknown error occurred."],
                isLoading: false
            });

            return;
        }

        const elapsed: number = new Date().getTime() - start;
        setTimeout(() => {
            if (!response.data) {
                this.setState({
                    loginErrors: response.errors ? response.errors : ["An unknown error occurred."],
                    isLoading: false
                });
            } else {
                authStore.currentUser = response.data;
                // No need to set "isLoading" to false because we navigate away anyway.
            }
        }, 500 - elapsed);
    };
}

export { LoginForm };
