import { observer } from "mobx-react";
import * as React from "react";
import { Route, Router, Switch } from "react-router-dom";
import { EditorSite } from "../sites/dashboard/EditorSite";
import { authStore } from "../stores/AuthStore";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { DashboardRouter } from "./DashboardRouter";
import { history } from "./history";
import { PrivateRoute } from "./PrivateRoute";
import { Routes } from "./Routes";
import { RoutingManager } from "./RoutingManager";
import { SiteRouter } from "./SiteRouter";
import { generalStore } from "../stores/GeneralStore";
import { PaymentSuccessSite } from "../sites/payment/PaymentSuccessSite";

@observer
class AppRouter extends React.Component {
    render() {
        if (authStore.hydrationFinished && generalStore.hasLoaded) {
            return (
                <Router history={history}>
                    <RoutingManager>
                        <Switch>
                            <PrivateRoute path={Routes.DASHBOARD.PROJECT_EDITOR_KEY} component={EditorSite} />
                            <PrivateRoute path={Routes.DASHBOARD.PROJECT_EDITOR} component={EditorSite} />
                            <Route path={Routes.PAYMENT.SUCCESS} component={PaymentSuccessSite} />

                            {/* Additional route if the project id is needed in the dashboard router. */}
                            <PrivateRoute path={Routes.DASHBOARD.PROJECT} component={DashboardRouter} />

                            <PrivateRoute path={Routes.DASHBOARD.ROOT} component={DashboardRouter} />
                            <Route path={Routes.OTHER.ROOT} component={SiteRouter} />
                        </Switch>
                    </RoutingManager>
                </Router>
            );
        } else {
            return <LoadingOverlay isVisible loadingText="App is loading..." />;
        }
    }
}

export { AppRouter };
