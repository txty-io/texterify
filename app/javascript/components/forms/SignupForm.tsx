import { Alert, Button, Form, Input, message } from "antd";
import * as React from "react";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { SiteWrapperLink } from "../ui/SiteWrapperLink";

interface IProps {
    onAccountCreated(): any;
}
interface IState {
    isLoading: boolean;
    signupErrors: string[];
}

class SignupForm extends React.Component<IProps, IState> {
    state: IState = {
        isLoading: false,
        signupErrors: []
    };

    handleSubmit = async (values: any) => {
        this.setState({ signupErrors: [] });

        const start: number = new Date().getTime();
        this.setState({ isLoading: true });

        const response: any = await AuthAPI.signup(
            values.username,
            values.email,
            values.password,
            values.passwordConfirmation
        );

        const elapsed: number = new Date().getTime() - start;
        setTimeout(() => {
            this.setState({ isLoading: false });

            if (response.status === "error") {
                this.setState({ signupErrors: response.errors });
            } else {
                authStore.currentUser = response.data;
                message.success("Account successfully created.");
                this.props.onAccountCreated();
            }
        }, 500 - elapsed);
    };

    getErrorMessage = (errors: any) => {
        const messages = [];

        errors.full_messages.map((error: string) => {
            messages.push(<div>{error}.</div>);
        });

        return messages;
    };

    render() {
        return (
            <>
                <LoadingOverlay isVisible={this.state.isLoading} loadingText="We are creating your account..." />
                <Form onFinish={this.handleSubmit}>
                    {(this.state.signupErrors.length > 0 || Object.keys(this.state.signupErrors).length > 0) && (
                        <Alert showIcon message={this.getErrorMessage(this.state.signupErrors)} type="error" />
                    )}

                    <h3>Username</h3>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, whitespace: true, message: "Please enter your username." }]}
                    >
                        <Input placeholder="Username" />
                    </Form.Item>

                    <h3>Email</h3>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, whitespace: true, message: "Please enter your email address." }]}
                    >
                        <Input placeholder="Email address" autoComplete="email" />
                    </Form.Item>

                    <h3>Password</h3>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, whitespace: true, message: "Please enter your password." }]}
                    >
                        <Input type="password" placeholder="Password" autoComplete="new-password" />
                    </Form.Item>

                    <h3>Password confirmation</h3>
                    <Form.Item
                        name="passwordConfirmation"
                        rules={[{ required: true, whitespace: true, message: "Please confirm your password." }]}
                    >
                        <Input type="password" placeholder="Password confirmation" autoComplete="new-password" />
                    </Form.Item>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: 8
                        }}
                    >
                        <SiteWrapperLink to={Routes.AUTH.LOGIN} style={{ fontWeight: 600 }}>
                            Already have an account?
                        </SiteWrapperLink>
                        <Button type="primary" htmlType="submit" style={{ marginBottom: 0 }}>
                            Sign up
                        </Button>
                    </div>
                </Form>
            </>
        );
    }
}

export { SignupForm };
