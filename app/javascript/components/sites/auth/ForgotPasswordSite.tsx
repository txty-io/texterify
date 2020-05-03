import * as React from "react";
import { ForgotPasswordForm } from "../../forms/ForgotPasswordForm";
import { SiteWrapper } from "../../ui/SiteWrapper";

class ForgotPasswordSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <h2>Reset your password</h2>
                <ForgotPasswordForm />
            </SiteWrapper>
        );
    }
}

export { ForgotPasswordSite };
