import { Alert, Button, Input, Form } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { MailOutlined, LockOutlined } from "@ant-design/icons";

interface IState {
    isLoading: boolean;
    loginErrors: string[];
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
                        <Alert showIcon message={this.state.loginErrors.join()} type="error" />
                    )}
                    <Form.Item name="email" rules={[{ required: true, message: "Please enter your email address." }]}>
                        <Input
                            prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                            placeholder="Email address"
                            autoComplete="emailsquad"
                        />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: "Please enter your password." }]}>
                        <Input
                            prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                        Log in
                    </Button>
                    <div style={{ textAlign: "right" }}>
                        <Link to={Routes.AUTH.SIGNUP}>Create a new account</Link>
                        <br />
                        <Link to={Routes.AUTH.FORGOTT_PASSWORD}>Forgot password?</Link>
                    </div>
                </Form>
            </>
        );
    }

    handleSubmit = async (values: any) => {
        this.setState({ loginErrors: [] });
        const start: number = new Date().getTime();
        this.setState({ isLoading: true });

        let response: any;

        try {
            response = await AuthAPI.login(values.email, values.password);
        } catch (e) {
            authStore.resetAuth();
            this.setState({
                loginErrors: ["Ein unbekannter Fehler ist aufgetreten."],
                isLoading: false
            });

            return;
        }

        const elapsed: number = new Date().getTime() - start;
        setTimeout(() => {
            if (!response.data) {
                this.setState({
                    loginErrors: response.errors ? response.errors : ["Ein unbekannter Fehler ist aufgetreten."],
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
