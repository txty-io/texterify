import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";
import { OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { OrganizationMembersSite } from "../sites/dashboard/OrganizationMembersSite";
import { OrganizationSettingsSite } from "../sites/dashboard/OrganizationSettingsSite";
import { OrganizationSite } from "../sites/dashboard/OrganizationSite";
import { dashboardStore } from "../stores/DashboardStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { PrivateRoute } from "./PrivateRoute";
import { Routes } from "./Routes";

type IProps = RouteComponentProps<{ organizationId: string }> & {};
interface IState { }

@observer
class OrganizationRouter extends React.Component<IProps, IState> {
  async componentDidMount() {
    await this.fetchOrganization();
  }

  fetchOrganization = async () => {
    const getOrganizationResponse = await OrganizationsAPI.getOrganization(this.props.match.params.organizationId);
    if (getOrganizationResponse.errors) {
      this.props.history.push(Routes.DASHBOARD.ORGANIZATIONS);
    } else {
      dashboardStore.currentOrganization = getOrganizationResponse.data;
    }

    this.forceUpdate();
  }

  render() {
    if (this.isInvalidOrganization()) {
      return <LoadingOverlay isVisible loadingText="Organization is loading..." />;
    }

    return (
      <>
        <Switch>
          <PrivateRoute exact path={Routes.DASHBOARD.ORGANIZATION} component={OrganizationSite} />
          <PrivateRoute exact path={Routes.DASHBOARD.ORGANIZATION_MEMBERS} component={OrganizationMembersSite} />
          <PrivateRoute exact path={Routes.DASHBOARD.ORGANIZATION_SETTINGS} component={OrganizationSettingsSite} />
        </Switch>
      </>
    );
  }

  isInvalidOrganization = () => {
    if (!dashboardStore.currentOrganization ||
      dashboardStore.currentOrganization.id !== this.props.match.params.organizationId
    ) {
      this.fetchOrganization();

      return true;
    } else {
      return false;
    }

  }
}

export { OrganizationRouter };
