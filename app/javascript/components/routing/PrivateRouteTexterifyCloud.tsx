import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { authStore } from "../stores/AuthStore";
import { Routes } from "./Routes";

const PrivateRouteTexterifyCloud = ({ component: Component, ...rest }) => {
    return (
        <Route
            {...rest}
            render={(props) => {
                return authStore.isAuthenticated && process.env.PROPRIETARY_MODE === "true" ? (
                    <Component {...props} />
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

export { PrivateRouteTexterifyCloud };
