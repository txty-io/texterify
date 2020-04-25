import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { AccountConfirmationSite } from "../sites/auth/AccountConfirmationSite";
import { ForgotPasswordSite } from "../sites/auth/ForgotPasswordSite";
import { LoginSite } from "../sites/auth/LoginSite";
import { NewPasswordSite } from "../sites/auth/NewPasswordSite";
import { SignupSite } from "../sites/auth/SignupSite";
import { PublicRouteRedirectDashboard } from "./PublicRouteRedirectDashboard";
import { Routes } from "./Routes";

interface IProps {
    location?: any;
}

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
                    <Route exact path={Routes.AUTH.NEW_PASSWORD_SITE} component={NewPasswordSite} />
                </Switch>
            </>
        );
    }

    render() {
        return <>{this.renderRoutes()}</>;
    }
}

export { SiteRouter };
