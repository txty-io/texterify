import { Alert, Button, Checkbox, Form, Icon, Input } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";

interface IProps {
  form: any;
  onAccountCreated(): any;
}
interface IState {
  isLoading: boolean;
  signupErrors: string[];
}

class SignupFormUnwrapped extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isLoading: false,
      signupErrors: []
    };
  }

  handleSubmit = (e: any): void => {
    e.preventDefault();

    this.setState({ signupErrors: [] });

    this.props.form.validateFields(async (errors: any, values: any) => {
      if (!errors) {
        console.info("Received values of form:", values);

        const start: number = new Date().getTime();
        this.setState({ isLoading: true });

        const response: any = await AuthAPI.signup(values.username, values.email, values.password, values.passwordConfirmation);
        console.info("Received response:", response);

        const elapsed: number = new Date().getTime() - start;
        setTimeout(
          () => {
            this.setState({ isLoading: false });

            if (response.status === "error") {
              this.setState({ signupErrors: response.errors });
            } else {
              authStore.currentUser = response.data;
              this.props.onAccountCreated();
            }
          },
          500 - elapsed
        );
      }
    });
  }

  getErrorMessage = (errors: any) => {
    const messages = [];

    errors.full_messages.map((error: string) => {
      messages.push(<div>{error}.</div>);
    });

    return messages;
  }

  render(): JSX.Element {
    const { getFieldDecorator } = this.props.form;

    return (
      <>
        <LoadingOverlay isVisible={this.state.isLoading} loadingText="We are creating your account..." />
        <Form onSubmit={this.handleSubmit}>
          {(this.state.signupErrors.length > 0 || Object.keys(this.state.signupErrors).length > 0) &&
            <Alert showIcon message={this.getErrorMessage(this.state.signupErrors)} type="error" />
          }

          <h3>Username</h3>
          <Form.Item>
            {getFieldDecorator("username", {
              rules: [{ required: true, message: "Please enter your username." }]
            })(
              <Input prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Username" />
            )}
          </Form.Item>

          <h3>Email address</h3>
          <Form.Item>
            {getFieldDecorator("email", {
              rules: [{ required: true, message: "Please enter your email address." }]
            })(
              <Input prefix={<Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Email address" autoComplete="email" />
            )}
          </Form.Item>

          <h3>Password</h3>
          <Form.Item>
            {getFieldDecorator("password", {
              rules: [{ required: true, message: "Please enter your password." }]
            })(
              <Input prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />} type="password" placeholder="Password" autoComplete="new-password" />
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator("passwordConfirmation", {
              rules: [{ required: true, message: "Please confirm your password." }]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                type="password"
                placeholder="Password confirmation"
                autoComplete="new-password"
              />
            )}
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Sign up
            </Button>
            <p>
              By clicking on "Sign up" you agree to
              our <Link to={Routes.OTHER.TERMS_OF_SERVICE}>terms of service</Link> and <Link to={Routes.OTHER.PRIVACY_POLICY}>privacy
              policy</Link>. We will never share your data with third parties.
            </p>
          </Form.Item>
        </Form>
      </>
    );
  }
}

const SignupForm: any = Form.create()(SignupFormUnwrapped);

export { SignupForm };
