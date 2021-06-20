import { message } from "antd";
import * as _ from "lodash";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { APIErrors } from "./APIErrors";

message.config({
    top: 12,
    duration: 4,
    maxCount: 3
});

const APIUtils = {
    saveTokenFromResponseIfAvailable: (response: any): void => {
        const accessToken: string = response.headers.get("access-token");
        const client: string = response.headers.get("client");

        if (accessToken) {
            authStore.accessToken = accessToken;
        }

        if (client) {
            authStore.client = client;
        }
    },

    /**
     * Handles errors like an invalid access token.
     */
    handleErrors: (response: any) => {
        if (response.errors) {
            console.error("API Errors:", response.errors);

            // Check if the used access token is still valid.
            if (Array.isArray(response.errors)) {
                response.errors.forEach((error) => {
                    if (error.code === APIErrors.INVALID_ACCESS_TOKEN) {
                        authStore.resetAuth();
                        message.info("Your session expired. Please log in again.");
                        history.push(Routes.AUTH.LOGIN);

                        return;
                    }
                });
            }
        }

        // if (response.error || response.errors) {
        //     throw response;
        // }

        return response;
    },

    getIncludedObject(object: { id: string; type: string }, included: any) {
        if (!object) {
            return null;
        }

        if (!object.id || !object.type) {
            console.error("Couldn't find property 'id' or 'type'.");
        }

        return _.find(included, (o) => {
            return o.id === object.id && o.type === object.type;
        });
    }
};

export { APIUtils };
