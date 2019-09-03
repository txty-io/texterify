import { Alert, Button, Form, Icon, Input, message } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";

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

  render(): JSX.Element {
    const { getFieldDecorator } = this.props.form;

    return (
      <>
        <Form onSubmit={this.handleSubmit}>
          {this.state.success && <Alert showIcon message="We sent you an email. Follow the instructions in the email to reset your password." type="success" />}
          <p>Enter your email address and we will send you the instructions to reset your password.</p>
          <Form.Item>
            {getFieldDecorator("email", {
              rules: [{ required: true, message: "Please enter your email address." }]
            })(
              <Input prefix={<Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Email address" />
            )}
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Send password recovery instructions
            </Button>
          </Form.Item>
        </Form>
        <p>
          <Link to={Routes.AUTH.LOGIN}>Login</Link>
          <br />
          <Link to={Routes.AUTH.SIGNUP}>Create account</Link>
        </p>
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
          const response = await AuthAPI.sendPasswordRecoveryInstructions(
            values.email
          );

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
  }
}

const ForgotPasswordForm: any = Form.create()(ForgotPasswordFormUnwrapped);

export { ForgotPasswordForm };
