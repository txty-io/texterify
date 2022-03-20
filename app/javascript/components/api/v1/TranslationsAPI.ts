import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ITranslation {
    id: string;
    type: "translation";
    attributes: { id: string; content: string };
    relationships: {
        language: { data: { id: "a66eeecf-e90d-4b6f-9bc6-dbaace157f68"; type: "language" } };
        export_config: { data: null };
    };
}

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
