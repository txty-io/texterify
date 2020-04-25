import * as React from "react";
import { NewPasswordForm } from "../../forms/NewPasswordForm";
import { SiteWrapper } from "../../ui/SiteWrapper";

interface IProps {}
interface IState {}

class NewPasswordSite extends React.Component<IProps, IState> {
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
