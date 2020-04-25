import * as React from "react";
import { Redirect, Route } from "react-router-dom";
import { authStore } from "../stores/AuthStore";
import { Routes } from "./Routes";

const PrivateRoute: any = ({ component: Component, ...rest }: any): JSX.Element => {
    return (
        <Route
            {...rest}
            render={(props: any): any => {
                return authStore.isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect
                        to={{
                            pathname: Routes.AUTH.LOGIN,
                            state: { from: props.location }
                        }}
                    />
                );}
            }}
        />
    );
};

export { PrivateRoute };
