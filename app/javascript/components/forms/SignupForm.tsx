import { Button, Checkbox, Form, Input, message } from "antd";
import * as queryString from "query-string";
import * as React from "react";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { history } from "../routing/history";
import { authStore } from "../stores/AuthStore";
import { CustomAlert } from "../ui/CustomAlert";
import { ErrorUtils } from "../ui/ErrorUtils";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { SiteWrapperLink } from "../ui/SiteWrapperLink";
import { IS_TEXTERIFY_CLOUD } from "../utilities/Env";

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
        this.setState({ signupErrors: [], isLoading: true });

        const response = await AuthAPI.signup(
            values.username,
            values.email,
            values.password,
            values.passwordConfirmation
        );

        this.setState({ isLoading: false });

        if (response.error) {
            if (response.message === "MAXIMUM_NUMBER_OF_USERS_REACHED") {
                ErrorUtils.showError(
                    "The maximum number of users for the instance license has been reached. Please inform the instance admin to upgrade the license."
                );
            } else if (response.message === "SIGN_UP_NOT_ENABLED") {
                ErrorUtils.showError(
                    "Registration has been disabled for this instance. You need an invite to be able to sign up."
                );
            } else if (response.message === "EMAIL_DOMAIN_IS_NOT_ALLOWED_TO_SIGN_UP") {
                ErrorUtils.showError("You are not allowed to sign up with this email.");
            } else {
                ErrorUtils.showError(response.message);
            }
        } else {
            if (response.status === "error") {
                this.setState({ signupErrors: response.errors });
            } else {
                authStore.currentUser = response.data;
                message.success("Account successfully created.");
                this.props.onAccountCreated();
            }
        }
    };

    getErrorMessage = (errors: any) => {
        const messages = [];

        errors.full_messages.map((error: string, index) => {
            messages.push(<div key={index}>{error}.</div>);
        });

        return messages;
    };

    render() {
        const currentQueryParams = queryString.parse(history.location.search);

        return (
            <>
                <LoadingOverlay isVisible={this.state.isLoading} loadingText="We are creating your account..." />
                <Form onFinish={this.handleSubmit} initialValues={{ email: currentQueryParams.locked_email }}>
                    {(this.state.signupErrors.length > 0 || Object.keys(this.state.signupErrors).length > 0) && (
                        <CustomAlert
                            description={this.getErrorMessage(this.state.signupErrors)}
                            type="error"
                            style={{ marginBottom: 24 }}
                        />
                    )}

                    <h3>Username</h3>
                    <p>This name will be visible to others. You can still change it later.</p>
                    <Form.Item
                        name="username"
                        rules={[{ required: true, whitespace: true, message: "Please enter your username." }]}
                    >
                        <Input autoFocus placeholder="Username" />
                    </Form.Item>

                    <h3>Email</h3>
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message: "Please enter your email address.",
                                type: "email"
                            }
                        ]}
                    >
                        <Input
                            placeholder="Email address"
                            autoComplete="email"
                            disabled={!!currentQueryParams.locked_email}
                        />
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

                    {IS_TEXTERIFY_CLOUD && (
                        <Form.Item
                            name="agreeTermsOfServiceAndPrivacyPolicy"
                            rules={[
                                {
                                    required: true,
                                    transform: (value) => {
                                        return value || undefined;
                                    },
                                    type: "boolean",
                                    message: "You must agree to the terms of service and privacy policy."
                                }
                            ]}
                            valuePropName="checked"
                        >
                            <Checkbox>
                                I agree to the{" "}
                                <a href={Routes.OTHER.TERMS_OF_SERVICE} target="_blank">
                                    terms of service
                                </a>{" "}
                                and{" "}
                                <a href={Routes.OTHER.PRIVACY_POLICY} target="_blank">
                                    privacy policy
                                </a>
                                .
                            </Checkbox>
                        </Form.Item>
                    )}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: 8
                        }}
                    >
                        <SiteWrapperLink to={Routes.AUTH.LOGIN}>Already have an account?</SiteWrapperLink>
                        <Button data-id="sign-up-submit" type="primary" htmlType="submit" style={{ marginBottom: 0 }}>
                            Sign up
                        </Button>
                    </div>
                </Form>
            </>
        );
    }
}

export { SignupForm };
