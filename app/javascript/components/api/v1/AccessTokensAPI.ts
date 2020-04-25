import { API } from "./API";
import { APIUtils } from "./APIUtils";

enum AccessTokensAPIErrors {
    NAME_ALREADY_TAKEN = "has already been taken"
}

interface ICreateTokenOptions {
    name: string;
}

const AccessTokensAPI = {
    getTokens: async () => {
        return API.getRequest("access_tokens", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    },

    createToken: async (options: ICreateTokenOptions): Promise<any> => {
        return API.postRequest("access_tokens", true, {
            name: options.name
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteToken: async (accessTokenId: string): Promise<any> => {
        return API.deleteRequest(`access_tokens/${accessTokenId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { AccessTokensAPI, AccessTokensAPIErrors };
