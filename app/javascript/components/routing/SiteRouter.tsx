import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { AccountConfirmationSite } from "../sites/auth/AccountConfirmationSite";
import { ForgotPasswordSite } from "../sites/auth/ForgotPasswordSite";
import { LoginSite } from "../sites/auth/LoginSite";
import { NewPasswordSite } from "../sites/auth/NewPasswordSite";
import { SignupSite } from "../sites/auth/SignupSite";
import { NotFoundSite } from "../sites/errors/NotFoundSite";
import { InvalidAccountConfirmationLinkSite } from "../sites/errors/InvalidAccountConfirmationLinkSite";
import { InvalidPasswordResetLinkSite } from "../sites/errors/InvalidPasswordResetLinkSite";
import { PublicRouteRedirectDashboard } from "./PublicRouteRedirectDashboard";
import { Routes } from "./Routes";

class SiteRouter extends React.Component {
    render() {
        return (
            <Switch>
                <PublicRouteRedirectDashboard exact path={Routes.OTHER.ROOT} component={LoginSite} />
                <Route exact path={Routes.AUTH.LOGIN} component={LoginSite} />
                <Route exact path={Routes.AUTH.SIGNUP} component={SignupSite} />
                <Route exact path={Routes.AUTH.FORGOTT_PASSWORD} component={ForgotPasswordSite} />
                <Route exact path={Routes.AUTH.ACCOUNT_CONFIRMATION} component={AccountConfirmationSite} />
                <Route exact path={Routes.AUTH.NEW_PASSWORD_SITE} component={NewPasswordSite} />
                <Route
                    exact
                    path={Routes.ERRORS.INVALID_PASSWORD_RESET_LINK}
                    component={InvalidPasswordResetLinkSite}
                />
                <Route
                    exact
                    path={Routes.ERRORS.INVALID_ACCOUNT_CONFIRMATION_LINK}
                    component={InvalidAccountConfirmationLinkSite}
                />
                <Route component={NotFoundSite} />
            </Switch>
        );
    }
}

export { SiteRouter };
