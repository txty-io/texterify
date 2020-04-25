import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Alert, Button, Input } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { MailOutlined } from "@ant-design/icons";

interface IProps {
    form: any;
}
interface IState {
    isLoading: boolean;
    success: boolean;
}

class ForgotPasswordFormUnwrapped extends React.Component<IProps, IState> {
    state: IState = {
        isLoading: false,
        success: false
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <>
                <Form onSubmit={this.handleSubmit}>
                    {this.state.success && (
                        <Alert
                            showIcon
                            message="We sent you an email. Follow the instructions in the email to reset your password."
                            type="success"
                        />
                    )}
                    <p>Enter your email address and we will send you the instructions to reset your password.</p>
                    <Form.Item>
                        {getFieldDecorator("email", {
                            rules: [{ required: true, message: "Please enter your email address." }]
                        })(
                            <Input
                                prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                                placeholder="Email address"
                            />
                        )}
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

    handleSubmit = (e: any): void => {
        this.setState({ success: false });

        e.preventDefault();
        this.props.form.validateFields(async (err: any, values: any) => {
            if (!err) {
                console.log("Received values of form: ", values);

                this.setState({ isLoading: true });

                try {
                    const response = await AuthAPI.sendPasswordRecoveryInstructions(values.email);

                    if (response.success) {
                        this.props.form.setFieldsValue({
                            email: undefined
                        });

                        this.setState({ success: true });
                    }
                } catch (e) {
                    console.error(e);
                }

                this.setState({ isLoading: false });
            }
        });
    };
}

const ForgotPasswordForm: any = Form.create()(ForgotPasswordFormUnwrapped);

export { ForgotPasswordForm };
