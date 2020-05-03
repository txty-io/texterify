import { Alert, Button, Input, Form } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { MailOutlined } from "@ant-design/icons";
import { authStore } from "../stores/AuthStore";
import { FormInstance } from "antd/lib/form";

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
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    initialValues={{ email: authStore.currentUser.email }}
                >
                    {this.state.success && (
                        <Alert
                            showIcon
                            message="We sent you an email. Follow the instructions in the email to reset your password."
                            type="success"
                        />
                    )}
                    <p>Enter your email address and we will send you the instructions to reset your password.</p>
                    <Form.Item name="email" rules={[{ required: true, message: "Please enter your email address." }]}>
                        <Input
                            prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                            placeholder="Email address"
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                            Send password recovery instructions
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ textAlign: "right" }}>
                    <Link to={Routes.AUTH.LOGIN}>Back to login</Link>
                    <br />
                    <Link to={Routes.AUTH.SIGNUP}>Create a new account</Link>
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
