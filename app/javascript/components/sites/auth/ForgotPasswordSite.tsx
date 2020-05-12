import * as React from "react";
import { ForgotPasswordForm } from "../../forms/ForgotPasswordForm";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

class ForgotPasswordSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <SiteWrapperHeader>Reset your password</SiteWrapperHeader>
                <ForgotPasswordForm />
            </SiteWrapper>
        );
    }
}

export { ForgotPasswordSite };
