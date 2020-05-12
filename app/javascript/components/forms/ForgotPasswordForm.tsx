import { Alert, Button, Form, Input } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { SiteWrapperLink } from "../ui/SiteWrapperLink";

interface IState {
    isLoading: boolean;
    success: boolean;
}

class ForgotPasswordForm extends React.Component<{}, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        isLoading: false,
        success: false
    };

    render() {
        return (
            <>
                <p style={{ marginBottom: 16 }}>
                    Enter your email address and we will send you an email to reset your password.
                </p>

                <Form ref={this.formRef} onFinish={this.handleSubmit}>
                    {this.state.success && (
                        <Alert
                            showIcon
                            message="We sent you an email. Follow the instructions in the email to reset your password."
                            type="success"
                        />
                    )}

                    <h3>Email</h3>
                    <Form.Item
                        name="email"
                        rules={[{ required: true, whitespace: true, message: "Please enter your email address." }]}
                    >
                        <Input placeholder="Email address" />
                    </Form.Item>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button type="primary" htmlType="submit">
                            Reset password
                        </Button>
                    </div>
                </Form>
                <div style={{ textAlign: "right" }}>
                    <SiteWrapperLink to={Routes.AUTH.LOGIN}>Back to login</SiteWrapperLink>
                </div>
                <LoadingOverlay isVisible={this.state.isLoading} loadingText="Loading..." />
            </>
        );
    }

    handleSubmit = async (values: any) => {
        this.setState({ success: false });
        console.log("Received values of form: ", values);

        this.setState({ isLoading: true });

        try {
            const response = await AuthAPI.sendPasswordRecoveryInstructions(values.email);

            if (response.success) {
                this.formRef.current.setFieldsValue({
                    email: undefined
                });

                this.setState({ success: true });
            }
        } catch (e) {
            console.error(e);
        }

        this.setState({ isLoading: false });
    };
}

export { ForgotPasswordForm };
