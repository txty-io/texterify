import { Alert, Button, Form, Icon, Input } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { AuthAPI } from "../api/v1/AuthAPI";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";

interface IProps {
  form: any;
}
interface IState {
  isLoading: boolean;
  loginErrors: string[];
}

class LoginFormUnwrapped extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      isLoading: false,
      loginErrors: []
    };
  }

  render(): JSX.Element {
    const { getFieldDecorator } = this.props.form;

    return (
      <>
        <LoadingOverlay isVisible={this.state.isLoading} loadingText="We are logging you in..." />
        <Form onSubmit={this.handleSubmit}>
          {this.state.loginErrors.length > 0 &&
            <Alert showIcon message={this.state.loginErrors.join()} type="error" />
          }
          <Form.Item>
            {getFieldDecorator("email", {
              rules: [{ required: true, message: "Please enter your email address." }]
            })(
              <Input prefix={<Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />} placeholder="Email address" autoComplete="emailsquad" />
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator("password", {
              rules: [{ required: true, message: "Please enter your password." }]
            })(
              <Input prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />} type="password" placeholder="Password" autoComplete="current-password" />
            )}
          </Form.Item>

          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Log in
          </Button>
          <div style={{ textAlign: "right" }}>
            <Link to={Routes.AUTH.SIGNUP}>Create a new account</Link>
            <br />
            <Link to={Routes.AUTH.FORGOTT_PASSWORD}>Forgot password?</Link>
          </div>
        </Form>
      </>
    );
  }

  handleSubmit = (event: any): void => {
    event.preventDefault();

    this.setState({ loginErrors: [] });

    this.props.form.validateFields(async (errors: any, values: any) => {
      if (!errors) {
        const start: number = new Date().getTime();
        this.setState({ isLoading: true });

        let response: any;

        try {
          response = await AuthAPI.login(values.email, values.password);
        } catch (e) {
          authStore.resetAuth();
          this.setState({
            loginErrors: ["Ein unbekannter Fehler ist aufgetreten."],
            isLoading: false
          });

          return;
        }

        const elapsed: number = new Date().getTime() - start;
        setTimeout(
          () => {
            if (!response.data) {
              this.setState({
                loginErrors: response.errors ? response.errors : ["Ein unbekannter Fehler ist aufgetreten."],
                isLoading: false
              });
            } else {
              authStore.currentUser = response.data;
              // No need to set "isLoading" to false because we navigate away anyway.
            }
          },
          500 - elapsed
        );
      }
    });
  }
}

const LoginForm: any = Form.create()(LoginFormUnwrapped);

export { LoginForm };
