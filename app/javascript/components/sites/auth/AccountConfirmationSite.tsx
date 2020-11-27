import { Alert } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { SiteWrapper } from "../../ui/SiteWrapper";
import { SiteWrapperHeader } from "../../ui/SiteWrapperHeader";

class AccountConfirmationSite extends React.Component {
    render() {
        return (
            <SiteWrapper>
                <SiteWrapperHeader>Everything is set up</SiteWrapperHeader>
                <Alert showIcon message="You have successfully confirmed your account." type="success" />
                <div style={{ marginTop: 16 }}>
                    <Link to={Routes.AUTH.LOGIN}>Go to login</Link>
                </div>
            </SiteWrapper>
        );
    }
}

export { AccountConfirmationSite };
