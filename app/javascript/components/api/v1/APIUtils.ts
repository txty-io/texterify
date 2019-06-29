import { message } from "antd";
import * as _ from "lodash";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { APIErrors } from "./APIErrors";

message.config({
  top: 12,
  duration: 2,
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
  handleErrors: (response: any): any => {
    // Check if the used access token is still valid.
    if (response.errors && Array.isArray(response.errors)) {
      response.errors.forEach((error) => {
        if (error.code === APIErrors.INVALID_ACCESS_TOKEN) {
          authStore.resetAuth();
          history.push(Routes.AUTH.LOGIN);

          return;
        }
      });
    }

    // Display the error messages.
    if (response.errors && Array.isArray(response.errors)) {
      response.errors.map((error) => {
        // TODO: Remove if when possible.
        if (error.message) {
          message.error(error.message);
        } else if (error.details) {
          message.error(error.details);
        } else {
          message.error(error);
        }
      });
    } else if (response.errors) {
      const keys = Object.keys(response.errors);
      let errorMessage = "";
      keys.forEach((key) => {
        response.errors[key].forEach((keyError) => {
          errorMessage += `${key.charAt(0).toUpperCase() + key.slice(1)} ${keyError}. `;
        });
      });
      message.error(errorMessage.trim());
    }

    return response;
  },

  getIncludedObject(object: any, included: any): any {
    if (!object) {
      return null;
    }

    return _.find(included, (o) => {
      return o.id === object.id && o.type === object.type;
    });
  }
};

export { APIUtils };
