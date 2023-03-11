import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps, Switch } from "react-router-dom";
import { OrganizationsAPI } from "../api/v1/OrganizationsAPI";
import { OrganizationForbiddenWordsSite } from "../sites/dashboard/OrganizationForbiddenWordsSite";
import { OrganizationMachineTranslationSite } from "../sites/dashboard/OrganizationMachineTranslationSite";
import { OrganizationMembersSite } from "../sites/dashboard/OrganizationMembersSite";
import { OrganizationSettingsSite } from "../sites/dashboard/OrganizationSettingsSite";
import { OrganizationSite } from "../sites/dashboard/OrganizationSite";
import { OrganizationSubscriptionSite } from "../sites/dashboard/OrganizationSubscriptionSite";
import { OrganizationValidationsSite } from "../sites/dashboard/OrganizationValidationsSite";
import { dashboardStore } from "../stores/DashboardStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { UserDeactivatedOrganizationModal } from "../ui/UserDeactivatedOrganizationModal";
import { PrivateRoute } from "./PrivateRoute";
import { PrivateRouteCloud } from "./PrivateRouteCloud";
import { Routes } from "./Routes";

type IProps = RouteComponentProps<{ organizationId: string }>;

@observer
class OrganizationRouter extends React.Component<IProps> {
    async componentDidMount() {
        await this.fetchOrganization();
    }

    async componentDidUpdate() {
        if (this.isCurrentOrganizationInvalid()) {
            await this.fetchOrganization();
        }
    }

    fetchOrganization = async () => {
        const getOrganizationResponse = await OrganizationsAPI.getOrganization(this.props.match.params.organizationId);
        if (getOrganizationResponse.errors) {
            this.props.history.push(Routes.DASHBOARD.ORGANIZATIONS);
        } else {
            dashboardStore.currentOrganization = getOrganizationResponse.data;
        }
    };

    render() {
        if (this.isCurrentOrganizationInvalid()) {
            return <LoadingOverlay isVisible loadingText="Organization is loading..." />;
        }

        return (
            <>
                <Switch>
                    <PrivateRoute exact path={Routes.DASHBOARD.ORGANIZATION} component={OrganizationSite} />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.ORGANIZATION_MEMBERS}
                        component={OrganizationMembersSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.ORGANIZATION_SETTINGS}
                        component={OrganizationSettingsSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.ORGANIZATION_MACHINE_TRANSLATION}
                        component={OrganizationMachineTranslationSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.ORGANIZATION_VALIDATIONS}
                        component={OrganizationValidationsSite}
                    />
                    <PrivateRoute
                        exact
                        path={Routes.DASHBOARD.ORGANIZATION_FORBIDDEN_WORDS}
                        component={OrganizationForbiddenWordsSite}
                    />
                    <PrivateRouteCloud
                        exact
                        path={Routes.DASHBOARD.ORGANIZATION_SUBSCRIPTION}
                        component={OrganizationSubscriptionSite}
                    />
                </Switch>

                {dashboardStore.currentOrganization?.attributes.current_user_deactivated && (
                    <UserDeactivatedOrganizationModal />
                )}
            </>
        );
    }

    isCurrentOrganizationInvalid = () => {
        return (
            !dashboardStore.currentOrganization ||
            dashboardStore.currentOrganization.id !== this.props.match.params.organizationId
        );
    };
}

export { OrganizationRouter };
