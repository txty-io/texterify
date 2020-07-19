import { API } from "./API";
import { APIUtils } from "./APIUtils";

const PostProcessingRulesAPI = {
    getPostProcessingRules: async (projectId: string, options?: any) => {
        return API.getRequest(`projects/${projectId}/post-processing-rules`, true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createPostProcessingRule: async (options: {
        projectId: string;
        name: string;
        searchFor: string;
        replaceWith: string;
    }) => {
        return API.postRequest(`projects/${options.projectId}/post-processing-rules`, true, {
            name: options.name,
            searchFor: options.searchFor,
            replaceWith: options.replaceWith
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updatePostProcessingRule: async (options: {
        projectId: string;
        ruleId: string;
        name: string;
        searchFor: string;
        replaceWith: string;
    }) => {
        return API.putRequest(`projects/${options.projectId}/post-processing-rules/${options.ruleId}`, true, {
            name: options.name,
            searchFor: options.searchFor,
            replaceWith: options.replaceWith
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deletePostProcessingRules: async (projectId: string, rules: any[]) => {
        return API.deleteRequest(`projects/${projectId}/post-processing-rules`, true, {
            rules: rules
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { PostProcessingRulesAPI };
