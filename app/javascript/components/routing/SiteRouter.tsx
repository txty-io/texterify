import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { AccountConfirmationSite } from "../sites/auth/AccountConfirmationSite";
import { ForgotPasswordSite } from "../sites/auth/ForgotPasswordFormSite";
import { LoginSite } from "../sites/auth/LoginSite";
import { SignupSite } from "../sites/auth/SignupSite";
import { PublicRouteRedirectDashboard } from "./PublicRouteRedirectDashboard";
import { Routes } from "./Routes";

type IProps = {
  location?: any;
};

class SiteRouter extends React.Component<IProps, null> {
  renderRoutes(): JSX.Element {
    return (
      <>
        <Switch>
          <PublicRouteRedirectDashboard exact path={Routes.OTHER.ROOT} component={LoginSite} />
          <Route exact path={Routes.AUTH.LOGIN} component={LoginSite} />
          <Route exact path={Routes.AUTH.SIGNUP} component={SignupSite} />
          <Route exact path={Routes.AUTH.FORGOTT_PASSWORD} component={ForgotPasswordSite} />
          <Route exact path={Routes.AUTH.ACCOUNT_CONFIRMATION} component={AccountConfirmationSite} />
        </Switch>
      </>
    );
  }

  render(): JSX.Element {
    return (
      <>
        {this.renderRoutes()}
      </>
    );
  }
}

export { SiteRouter };
