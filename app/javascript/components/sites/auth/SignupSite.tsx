import { Button } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link, Redirect, RouteComponentProps } from "react-router-dom";
import { SignupForm } from "../../forms/SignupForm";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { SiteWrapper } from "../../ui/SiteWrapper";

type IProps = RouteComponentProps & {};
interface IState { }

@observer
class SignupSite extends React.Component<IProps, IState> {
  onAccountCreated = () => {
    this.props.history.push(Routes.DASHBOARD.ROOT);
  }

  render(): JSX.Element {
    console.log("Authentication status:", authStore.isAuthenticated);

    return !authStore.isAuthenticated ? (
      <SiteWrapper
        title="Hello, Friend."
        content={
          <>
            Enter your personal information to start the journey.
            <p style={{ fontWeight: "bold", textTransform: "uppercase", fontSize: 12, marginTop: 24 }}>or</p>
            <Link to={Routes.AUTH.LOGIN}>
              <Button ghost style={{ marginTop: 24, padding: "12px 80px", height: "auto", borderRadius: 40 }}>
                Log in to your account
              </Button>
            </Link>
          </>
        }
      >
        <h2>Create a new account</h2>
        <SignupForm onAccountCreated={this.onAccountCreated} />
        <Link to={Routes.AUTH.LOGIN} style={{ marginTop: 10 }}>You already have an account?</Link>
      </SiteWrapper>
    ) : (
        <Redirect to={Routes.DASHBOARD.ROOT} />
      );
  }
}

export { SignupSite };
