import { API } from "./API";
import { APIUtils } from "./APIUtils";

const ValidationRulesAPI = {
    getValidationRules: async (projectId: string, options?: any) => {
        return API.getRequest(`projects/${projectId}/validation-rules`, true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createValidationRule: async (options: { projectId: string; name: string; type: string; content: string }) => {
        return API.postRequest(`projects/${options.projectId}/validation-rules`, true, {
            name: options.name,
            type: options.type,
            content: options.content
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateValidationRule: async (options: {
        projectId: string;
        ruleId: string;
        name: string;
        type: string;
        content: string;
    }) => {
        return API.putRequest(`projects/${options.projectId}/validation-rules/${options.ruleId}`, true, {
            name: options.name,
            type: options.type,
            content: options.content
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteValidationRules: async (projectId: string, rules: any[]) => {
        return API.deleteRequest(`projects/${projectId}/validation-rules`, true, {
            rules: rules
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ValidationRulesAPI };
