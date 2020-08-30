import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ILanguageConfig {
    id: string;
    type: string;
    attributes: {
        id: string;
        language_id: string;
        language_code: string;
    };
}

export interface IGetLanguageConfigsResponse {
    data: ILanguageConfig[];
}

const LanguageConfigsAPI = {
    getLanguageConfigs: async (options: {
        projectId: string;
        exportConfigId: string;
    }): Promise<IGetLanguageConfigsResponse> => {
        return API.getRequest(
            `projects/${options.projectId}/export_configs/${options.exportConfigId}/language_configs`,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createLanguageConfig: async (options: {
        projectId: string;
        exportConfigId: string;
        languageId: string;
        languageCode: string;
    }) => {
        return API.postRequest(
            `projects/${options.projectId}/export_configs/${options.exportConfigId}/language_configs`,
            true,
            {
                language_id: options.languageId,
                language_code: options.languageCode
            }
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateLanguageConfig: async (options: {
        projectId: string;
        exportConfigId: string;
        languageConfigId: string;
        languageId: string;
        languageCode: string;
    }) => {
        return API.putRequest(
            `projects/${options.projectId}/export_configs/${options.exportConfigId}/language_configs/${options.languageConfigId}`,
            true,
            {
                language_id: options.languageId,
                language_code: options.languageCode
            }
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteLanguageConfig: async (options: { projectId: string; exportConfigId: string; languageConfigId: string }) => {
        return API.deleteRequest(
            `projects/${options.projectId}/export_configs/${options.exportConfigId}/language_configs/${options.languageConfigId}`,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { LanguageConfigsAPI };
