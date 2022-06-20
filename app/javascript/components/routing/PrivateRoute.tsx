import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { authStore } from "../stores/AuthStore";
import { Routes } from "./Routes";

const PrivateRoute = ({ component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                return authStore.isAuthenticated ? (
                    <Component {...props} {...rest.componentParams} />
                ) : (
                    <Redirect
                        to={{
                            pathname: Routes.AUTH.LOGIN,
                            state: { from: props.location }
                        }}
                    />
                );
            }}
        />
    );
};

export { PrivateRoute };
