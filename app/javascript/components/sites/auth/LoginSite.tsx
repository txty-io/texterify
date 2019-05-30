import { Button } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link, Redirect } from "react-router-dom";
import { LoginForm } from "../../forms/LoginForm";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { SiteWrapper } from "../../ui/SiteWrapper";

interface IProps { }
interface IState { }

@observer
class LoginSite extends React.Component<IProps, IState> {
  render(): JSX.Element {
    return !authStore.isAuthenticated ? (
      <SiteWrapper
        title="Welcome back."
        content={
          <>
            Log in with your personal information to get started.
            <div style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: 12, marginTop: 24 }}>or</div>
            <Link to={Routes.AUTH.SIGNUP}>
              <Button ghost style={{ marginTop: 24, padding: "12px 80px", height: "auto", borderRadius: 40 }}>
                Sign up
              </Button>
            </Link>
          </>
        }
      >
        <h2>Login</h2>
        <LoginForm />
      </SiteWrapper>
    ) : (
        <Redirect to={Routes.DASHBOARD.ROOT} />
      );
  }
}

export { LoginSite };
