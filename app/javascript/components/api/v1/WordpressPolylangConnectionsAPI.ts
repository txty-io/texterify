import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IWordpressPolylangConnection {
    data: {
        attributes: {
            wordpress_url: string;
            auth_user: string;
        };
        id: string;
        type: "wordpress_polylang_connection";
    };
}

const WordpressPolylangConnectionsAPI = {
    getConnection: async (options: { projectId: string }): Promise<IWordpressPolylangConnection> => {
        return API.getRequest(`projects/${options.projectId}/wordpress_polylang_connection`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateConnection: async (options: {
        projectId: string;
        wordpressURL: string;
        authUser: string;
    }): Promise<boolean> => {
        return API.putRequest(`projects/${options.projectId}/wordpress_polylang_connection`, true, {
            wordpress_url: options.wordpressURL,
            auth_user: options.authUser
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    websiteReachable: async (options: { projectId: string }): Promise<boolean> => {
        return API.getRequest(`projects/${options.projectId}/wordpress_polylang_connection/website_reachable`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    wordpressRestActivated: async (options: { projectId: string }): Promise<boolean> => {
        return API.getRequest(
            `projects/${options.projectId}/wordpress_polylang_connection/wordpress_rest_activated`,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    pullWordpressContent: async (options: { projectId: string }): Promise<any> => {
        return API.postRequest(`projects/${options.projectId}/wordpress_polylang_connection/pull`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { WordpressPolylangConnectionsAPI };
