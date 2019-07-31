import { observer } from "mobx-react";
import * as React from "react";
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
    return !authStore.isAuthenticated ?
      (
        <SiteWrapper>
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
