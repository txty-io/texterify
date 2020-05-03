import { observer } from "mobx-react";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { LoginForm } from "../../forms/LoginForm";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { SiteWrapper } from "../../ui/SiteWrapper";

@observer
class LoginSite extends React.Component {
    render() {
        return !authStore.isAuthenticated ? (
            <SiteWrapper>
                <h2>Welcome back</h2>
                <LoginForm />
            </SiteWrapper>
        ) : (
            <Redirect to={Routes.DASHBOARD.ROOT} />
        );
    }
}

export { LoginSite };
