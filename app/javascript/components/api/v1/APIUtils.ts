import { message } from "antd";
import * as _ from "lodash";
import moment from "moment";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { APIErrors } from "./APIErrors";

export interface IGenericAPIResponse {
    error: boolean;
    message: string;
}

message.config({
    top: 12,
    duration: 4,
    maxCount: 3
});

let LAST_SESSION_EXPIRED_MESSAGE_SHOWN: moment.Moment;

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
    handleErrors: (response: any, throwError?: boolean) => {
        if (response?.errors) {
            console.error("API Errors:", response.errors);

            // Check if the used access token is still valid.
            if (Array.isArray(response.errors)) {
                response.errors.forEach((error) => {
                    if (error.code === APIErrors.INVALID_ACCESS_TOKEN) {
                        // Only show the session expired notification if it hasn't been shown in the last 5 minutes.
                        if (
                            !LAST_SESSION_EXPIRED_MESSAGE_SHOWN ||
                            moment().isAfter(LAST_SESSION_EXPIRED_MESSAGE_SHOWN.add(5, "minutes"))
                        ) {
                            LAST_SESSION_EXPIRED_MESSAGE_SHOWN = moment();
                            authStore.resetAuth();
                            message.info("Your session expired. Please log in again.");
                            history.push(Routes.AUTH.LOGIN);

                            return;
                        }
                    }
                });
            }
        }

        if (throwError) {
            throw response;
        } else {
            return response;
        }
    },

    getIncludedObject(object: { id: string; type: string } | null, included: any) {
        if (!object) {
            return null;
        }

        if (!object.id || !object.type) {
            console.error("Couldn't find property 'id' or 'type'.");
        }

        return _.find(included, (o) => {
            return o.id === object.id && o.type === object.type;
        });
    },

    /**
     * Converts a data URI to a blob.
     * See https://github.com/graingert/datauritoblob/blob/master/dataURItoBlob.js.
     */
    dataURItoBlob(dataURI: any) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        const byteString = atob(dataURI.split(",")[1]);
        // separate out the mime component
        const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        // write the bytes of the string to an ArrayBuffer
        const ab = new ArrayBuffer(byteString.length);
        const dw = new DataView(ab);
        for (let i = 0; i < byteString.length; i++) {
            dw.setUint8(i, byteString.charCodeAt(i));
        }
        // write the ArrayBuffer to a blob, and you're done

        return new Blob([ab], { type: mimeString });
    }
};

export { APIUtils };
