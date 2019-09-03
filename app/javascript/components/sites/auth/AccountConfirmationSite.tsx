import * as _ from "lodash";
import * as React from "react";
import { Link } from "react-router-dom";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { SiteWrapper } from "../../ui/SiteWrapper";

interface IProps { }
interface IState { }

class AccountConfirmationSite extends React.Component<IProps, IState> {
  render(): JSX.Element {
    return (
      <SiteWrapper>
        <h2>You have successfully confirmed your account.</h2>
        <p>Everything is set up.</p>
        <Link to={Routes.AUTH.LOGIN}>Go to login</Link>
      </SiteWrapper>
    );
  }
}

export { AccountConfirmationSite };
