import * as React from "react";
import { LoginForm } from "../../forms/LoginForm";
import { Routes } from "../../routing/Routes";
import { history } from "../../routing/history";
import { authStore } from "../../stores/AuthStore";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";
import { t } from "../../i18n/Util";

export function LoginSite() {
    React.useEffect(() => {
        if (authStore.isAuthenticated) {
            history.push({
                pathname: Routes.DASHBOARD.PROJECTS
            });
        }
    }, [authStore.isAuthenticated]);

    return (
        <SiteWrapper>
            <SiteWrapperHeader>{t("component.login_site.title")}</SiteWrapperHeader>
            <LoginForm />
        </SiteWrapper>
    );
}
