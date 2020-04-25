import { API } from "./API";
import { APIUtils } from "./APIUtils";

const TranslationsAPI = {
    updateTranslation: async (options: {
        projectId: string;
        languageId: string;
        keyId: string;
        content: string;
        exportConfigId?: string;
    }) => {
        return API.postRequest(`projects/${options.projectId}/translations`, true, {
            language_id: options.languageId,
            key_id: options.keyId,
            translation: {
                content: options.content
            },
            export_config_id: options.exportConfigId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { TranslationsAPI };
