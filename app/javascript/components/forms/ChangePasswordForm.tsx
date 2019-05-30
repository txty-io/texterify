import { Alert, Button, Checkbox, Form, Icon, Input } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { LoadingOverlay } from "../ui/LoadingOverlay";

interface IProps {
  form: any;
}
interface IState {
  isLoading: boolean;
  loginErrors: string[];
  success: boolean;
}

class ChangePasswordFormUnwrapped extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isLoading: false,
      loginErrors: [],
      success: false
    };
  }

  renderErrors = (): JSX.Element[] => {
    const errors: JSX.Element[] = [];
    this.state.loginErrors.map((error: string, index: number) => {
      errors.push(<div key={index}>{error}</div>);
    });

    return errors;
  }

  render(): JSX.Element {
    const { getFieldDecorator } = this.props.form;

    return (
      <>
        <LoadingOverlay isVisible={this.state.isLoading} loadingText="We are changing your password..." />
        <Form onSubmit={this.handleSubmit} style={{ maxWidth: "100%" }}>
          {this.state.loginErrors.length > 0 &&
            <Alert showIcon message={this.renderErrors()} type="error" />
          }

          {this.state.success && <Alert showIcon message="Password changed successfully." type="success" />}

          <h3>Change password</h3>
          <p>Enter your old and new password to change your password.</p>

          <h4>Current password</h4>
          <Form.Item>
            {getFieldDecorator("current_password", {
              rules: [{ required: true, message: "Please enter your current password." }]
            })(
              <Input prefix={<Icon type="key" style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Current password" type="password" />
            )}
          </Form.Item>

          <h4>New password</h4>
          <Form.Item>
            {getFieldDecorator("new_password", {
              rules: [{ required: true, message: "Please enter your new password." }]
            })(
              <Input prefix={<Icon type="key" style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="New password" type="password" />
            )}
          </Form.Item>

          <h4>New password confirmation</h4>
          <Form.Item>
            {getFieldDecorator("new_password_confirmation", {
              rules: [{ required: true, message: "Please confirm your new password." }]
            })(
              <Input
                prefix={<Icon type="key" style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="New password confirmation"
                type="password"
              />
            )}
          </Form.Item>

          <Form.Item style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" htmlType="submit">
              Change password
          </Button>
          </Form.Item>
        </Form>
      </>
    );
  }

  private handleSubmit = (e: any): void => {
    e.preventDefault();
    this.setState({
      loginErrors: [],
      success: false
    });
    this.props.form.validateFields(async (err: any, values: any) => {
      if (!err) {
        const start: number = new Date().getTime();
        this.setState({ isLoading: true });

        let response: any;

        try {
          response = await AuthAPI.changePassword(
            values.current_password,
            values.new_password,
            values.new_password_confirmation
          );
        } catch (e) {
          this.setState({
            loginErrors: ["Ein unbekannter Fehler ist aufgetreten."],
            isLoading: false
          });

          return;
        }

        const elapsed: number = new Date().getTime() - start;
        setTimeout(
          () => {
            if (!response.success) {
              this.setState({
                loginErrors: response.errors && response.errors.full_messages ?
                  response.errors.full_messages :
                  ["Ein unbekannter Fehler ist aufgetreten."],
                isLoading: false
              });
            } else {
              this.setState({
                isLoading: false,
                success: true
              });
            }
          },
          500 - elapsed
        );
      }
    });
  }
}

const ChangePasswordForm: any = Form.create()(ChangePasswordFormUnwrapped);

export { ChangePasswordForm };
