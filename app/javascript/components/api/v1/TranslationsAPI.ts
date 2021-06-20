import { API } from "./API";
import { APIUtils } from "./APIUtils";

const TranslationsAPI = {
    createTranslation: async (options: {
        projectId: string;
        languageId: string;
        keyId: string;
        content: string;
        exportConfigId?: string;
        triggerAutoTranslate?: boolean;
    }) => {
        return API.postRequest(`projects/${options.projectId}/translations`, true, {
            language_id: options.languageId,
            key_id: options.keyId,
            translation: {
                content: options.content
            },
            export_config_id: options.exportConfigId,
            trigger_auto_translate: options.triggerAutoTranslate
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { TranslationsAPI };
