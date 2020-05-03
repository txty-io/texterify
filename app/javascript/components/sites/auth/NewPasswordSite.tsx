import * as React from "react";
import { NewPasswordForm } from "../../forms/NewPasswordForm";
import { SiteWrapper } from "../../ui/SiteWrapper";

class NewPasswordSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <h2>Set a new password</h2>
                <NewPasswordForm />
            </SiteWrapper>
        );
    }
}

export { NewPasswordSite };
