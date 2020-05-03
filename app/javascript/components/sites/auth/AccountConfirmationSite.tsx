import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { SiteWrapper } from "../../ui/SiteWrapper";

class AccountConfirmationSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <h2>You have successfully confirmed your account.</h2>
                <p>Everything is set up</p>
                <Link to={Routes.AUTH.LOGIN}>Go to login</Link>
            </SiteWrapper>
        );
    }
}

export { AccountConfirmationSite };
