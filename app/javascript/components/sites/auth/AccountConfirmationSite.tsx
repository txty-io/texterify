import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

class AccountConfirmationSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <SiteWrapperHeader>You have successfully confirmed your account.</SiteWrapperHeader>
                <p>Everything is set up.</p>
                <Link to={Routes.AUTH.LOGIN}>Go to login</Link>
            </SiteWrapper>
        );
    }
}

export { AccountConfirmationSite };
