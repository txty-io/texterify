import { observer } from "mobx-react";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { SignupForm } from "../../forms/SignupForm";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

@observer
class SignupSite extends React.Component {
    onAccountCreated = () => {
        history.push(Routes.DASHBOARD.ROOT);
    };

    render() {
        return !authStore.isAuthenticated ? (
            <SiteWrapper>
                <SiteWrapperHeader>Create your account</SiteWrapperHeader>
                <SignupForm onAccountCreated={this.onAccountCreated} />
            </SiteWrapper>
        ) : (
            <Redirect to={Routes.DASHBOARD.ROOT} />
        );
    }
}

export { SignupSite };
