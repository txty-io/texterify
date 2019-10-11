import * as React from "react";
import { ForgotPasswordForm } from "../../forms/ForgotPasswordForm";
import { SiteWrapper } from "../../ui/SiteWrapper";

interface IProps { }
interface IState { }

class ForgotPasswordSite extends React.Component<IProps, IState> {
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
