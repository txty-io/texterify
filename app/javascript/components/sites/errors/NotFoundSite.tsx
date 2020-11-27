import { Alert } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { ErrorSiteWrapper } from "../../ui/ErrorSiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

export function NotFoundSite() {
    return (
        <ErrorSiteWrapper>
            <SiteWrapperHeader>Site not found</SiteWrapperHeader>

            <Alert showIcon message="The site you requested could not be found." type="error" />

            <div style={{ marginTop: 16 }}>
                <Link to={Routes.AUTH.LOGIN}>Log in</Link>
            </div>
        </ErrorSiteWrapper>
    );
}
