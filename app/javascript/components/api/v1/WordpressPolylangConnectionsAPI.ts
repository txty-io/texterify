import { API } from "./API";
import { APIUtils, IGenericAPIResponse } from "./APIUtils";

export interface IWordpressPolylangConnection {
    data: {
        attributes: {
            wordpress_url: string;
            auth_user: string;
            password_set: boolean;
        };
        id: string;
        type: "wordpress_polylang_connection";
    };
}

export interface IWordpressContent {
    id: string;
    type: "wordpress_content";
    attributes: {
        id: string;
        wordpress_id: number;
        wordpress_modified: string;
        wordpress_type: string;
        wordpress_status: string;
        wordpress_content: string;
        wordpress_content_type: string;
        wordpress_title: string;
    };
}

export interface IGetWordpressContentsResponse {
    data: IWordpressContent[];
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
        authPassword: string;
    }): Promise<boolean> => {
        return API.putRequest(`projects/${options.projectId}/wordpress_polylang_connection`, true, {
            wordpress_url: options.wordpressURL,
            auth_user: options.authUser,
            auth_password: options.authPassword
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

    authenticationValid: async (options: { projectId: string }): Promise<boolean> => {
        return API.getRequest(`projects/${options.projectId}/wordpress_polylang_connection/authentication_valid`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    pullWordpressContent: async (options: { projectId: string }): Promise<IGenericAPIResponse> => {
        return API.postRequest(`projects/${options.projectId}/wordpress_polylang_connection/pull`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    pushWordpressContent: async (options: { projectId: string }): Promise<IGenericAPIResponse> => {
        return API.postRequest(`projects/${options.projectId}/wordpress_polylang_connection/push`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getWordpressContent: async (options: { projectId: string }): Promise<IGetWordpressContentsResponse> => {
        return API.getRequest(`projects/${options.projectId}/wordpress_polylang_connection/contents`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    importWordpressContent: async (options: { projectId: string; wordpressContentIds: string[] }): Promise<void> => {
        return API.postRequest(`projects/${options.projectId}/wordpress_polylang_connection/import`, true, {
            wordpress_content_ids: options.wordpressContentIds
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { WordpressPolylangConnectionsAPI };
