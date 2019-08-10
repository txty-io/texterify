import { Button, Checkbox, Form, Icon, Input } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { Routes } from "../routing/Routes";

interface IProps {
  form: any;
}
interface IState { }

class ForgotPasswordFormUnwrapped extends React.Component<IProps, IState> {
  render(): JSX.Element {
    const { getFieldDecorator } = this.props.form;

    return (
      <>
        <Form onSubmit={this.handleSubmit}>
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
      </>
    );
  }

  handleSubmit = (e: any): void => {
    e.preventDefault();
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        console.log("Received values of form: ", values);
      }
    });
  }
}

const ForgotPasswordForm: any = Form.create()(ForgotPasswordFormUnwrapped);

export { ForgotPasswordForm };
