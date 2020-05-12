import * as React from "react";
import { NewPasswordForm } from "../../forms/NewPasswordForm";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

class NewPasswordSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <SiteWrapperHeader>Set a new password</SiteWrapperHeader>
                <NewPasswordForm />
            </SiteWrapper>
        );
    }
}

export { NewPasswordSite };
