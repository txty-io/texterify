import { Alert, Button, Input, Form } from "antd";
import * as queryString from "query-string";
import * as React from "react";
import { Link } from "react-router-dom";
import { AuthAPI, IAuthData } from "../api/v1/AuthAPI";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { KeyOutlined } from "@ant-design/icons";

interface IState {
    isLoading: boolean;
    loginErrors: string[];
    success: boolean;
}

class NewPasswordForm extends React.Component<{}, IState> {
    state: IState = {
        isLoading: false,
        loginErrors: [],
        success: false
    };

    renderErrors = (): JSX.Element[] => {
        const errors: JSX.Element[] = [];
        this.state.loginErrors.map((error: string, index: number) => {
            errors.push(<div key={index}>{error}</div>);
        });

        return errors;
    };

    render() {
        return (
            <>
                <LoadingOverlay isVisible={this.state.isLoading} loadingText="We are changing your password..." />
                <Form onFinish={this.handleSubmit} style={{ maxWidth: "100%" }}>
                    {this.state.loginErrors.length > 0 && <Alert showIcon message={this.renderErrors()} type="error" />}

                    {this.state.success && <Alert showIcon message="Password changed successfully." type="success" />}

                    <h4>New password</h4>
                    <Form.Item
                        name="new_password"
                        rules={[{ required: true, whitespace: true, message: "Please enter your new password." }]}
                    >
                        <Input
                            prefix={<KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                            placeholder="New password"
                            type="password"
                        />
                    </Form.Item>

                    <h4>New password confirmation</h4>
                    <Form.Item
                        name="new_password_confirmation"
                        rules={[{ required: true, whitespace: true, message: "Please confirm your new password." }]}
                    >
                        <Input
                            prefix={<KeyOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                            placeholder="New password confirmation"
                            type="password"
                        />
                    </Form.Item>

                    <Form.Item style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button type="primary" htmlType="submit">
                            Change password
                        </Button>
                    </Form.Item>
                </Form>
                <p>
                    <Link to={Routes.AUTH.LOGIN}>Login</Link>
                    <br />
                    <Link to={Routes.AUTH.SIGNUP}>Create account</Link>
                </p>
            </>
        );
    }

    handleSubmit = async (values: any) => {
        this.setState({
            loginErrors: [],
            success: false
        });
        const start: number = new Date().getTime();
        this.setState({ isLoading: true });

        const parsed = queryString.parse(history.location.search);
        const header: IAuthData = {
            accessToken: parsed["access-token"] as string,
            client: parsed.client as string,
            uid: parsed.uid as string
        };

        let response: any;
        try {
            response = await AuthAPI.setNewPassword(values.new_password, values.new_password_confirmation, header);
        } catch (e) {
            this.setState({
                loginErrors: ["Ein unbekannter Fehler ist aufgetreten."],
                isLoading: false
            });

            return;
        }

        const elapsed: number = new Date().getTime() - start;
        setTimeout(() => {
            if (!response.success) {
                this.setState({
                    loginErrors:
                        response.errors && response.errors.full_messages
                            ? response.errors.full_messages
                            : ["Ein unbekannter Fehler ist aufgetreten."],
                    isLoading: false
                });
            } else {
                this.setState({
                    isLoading: false,
                    success: true
                });
            }
        }, 500 - elapsed);
    };
}

export { NewPasswordForm };
