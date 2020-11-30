import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { authStore } from "../stores/AuthStore";
import { Routes } from "./Routes";

const SuperadminRoute = ({ component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                return authStore.currentUser.is_superadmin ? (
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
};

export { SuperadminRoute };
