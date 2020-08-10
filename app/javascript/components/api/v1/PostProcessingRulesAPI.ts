import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IPostProcessingRuleRelationships {
    export_config: any;
}

export interface IPostProcessingRule {
    id: string;
    type: string;
    attributes: {
        id: string;
        name: string;
        search_for: string;
        replace_with: string;
    };
    relationships: IPostProcessingRuleRelationships;
}

export interface IGetPostProcessingRulesResponse {
    data: IPostProcessingRule[];
    included: any[];
    meta: {
        total: number;
    };
}

const PostProcessingRulesAPI = {
    getPostProcessingRules: async (
        projectId: string,
        options?: { page: number; perPage: number }
    ): Promise<IGetPostProcessingRulesResponse> => {
        return API.getRequest(`projects/${projectId}/post_processing_rules`, true, {
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
        exportConfigId: string;
    }) => {
        return API.postRequest(`projects/${options.projectId}/post_processing_rules`, true, {
            name: options.name,
            search_for: options.searchFor,
            replace_with: options.replaceWith,
            export_config_id: options.exportConfigId
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
        exportConfigId: string;
    }) => {
        return API.putRequest(`projects/${options.projectId}/post_processing_rules/${options.ruleId}`, true, {
            name: options.name,
            search_for: options.searchFor,
            replace_with: options.replaceWith,
            export_config_id: options.exportConfigId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deletePostProcessingRules: async (projectId: string, rules: any[]) => {
        return API.deleteRequest(`projects/${projectId}/post_processing_rules`, true, {
            rules: rules
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { PostProcessingRulesAPI };
