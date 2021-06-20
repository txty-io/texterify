import { observer } from "mobx-react";
import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { authStore } from "../stores/AuthStore";
import { Routes } from "./Routes";

const PublicRouteRedirectDashboard: any = observer(({ component: Component, ...rest }: any): JSX.Element => {
    return (
        <Route
            {...rest}
            render={(props: any): any => {
                return !authStore.isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: Routes.DASHBOARD.ROOT,
                            state: { from: props.location }
                        }}
                    />
                );
            }}
        />
    );
});

export { PublicRouteRedirectDashboard };
