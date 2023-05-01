import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { CustomAlert } from "../../ui/CustomAlert";
import { ErrorSiteWrapper } from "../../ui/ErrorSiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

export function InvalidPasswordResetLinkSite() {
    return (
        <ErrorSiteWrapper>
            <SiteWrapperHeader>Invalid password reset link</SiteWrapperHeader>

            <CustomAlert
                description="The password reset link is invalid or has already been used. Please request a new password reset link if needed."
                type="error"
            />

            <div style={{ marginTop: 16 }}>
                <Link to={Routes.AUTH.FORGOTT_PASSWORD}>Request new password reset link</Link>
            </div>
            <div style={{ marginTop: 8 }}>
                <Link to={Routes.AUTH.LOGIN}>Log in</Link>
            </div>
        </ErrorSiteWrapper>
    );
}
