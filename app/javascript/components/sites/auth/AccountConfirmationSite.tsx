import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { CustomAlert } from "../../ui/CustomAlert";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

class AccountConfirmationSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <SiteWrapperHeader>Everything is set up</SiteWrapperHeader>
                <CustomAlert description="You have successfully confirmed your account." type="info" />
                <div style={{ marginTop: 16 }}>
                    <Link to={Routes.AUTH.LOGIN}>Go to login</Link>
                </div>
            </SiteWrapper>
        );
    }
}

export { AccountConfirmationSite };
