import { observer } from "mobx-react";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { LoginForm } from "../../forms/LoginForm";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

@observer
class LoginSite extends React.Component {
    render() {
        return !authStore.isAuthenticated ? (
            <SiteWrapper>
                <SiteWrapperHeader>Log in</SiteWrapperHeader>
                <LoginForm />
            </SiteWrapper>
        ) : (
            <Redirect to={Routes.DASHBOARD.ROOT} />
        );
    }
}

export { LoginSite };
