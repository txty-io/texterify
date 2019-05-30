import { Button } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { ForgotPasswordForm } from "../../forms/ForgotPasswordForm";
import { Routes } from "../../routing/Routes";
import { SiteWrapper } from "../../ui/SiteWrapper";

interface IProps { }
interface IState { }

class ForgotPasswordSite extends React.Component<IProps, IState> {
  render(): JSX.Element {
    return (
      <SiteWrapper
        title="We can help you."
        content="Enter your email address and we will send you an password recovery email."
      >
        <h2>Reset password</h2>
        <ForgotPasswordForm />
      </SiteWrapper>
    );
  }
}

export { ForgotPasswordSite };
