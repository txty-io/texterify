import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ITranslation {
    id: string;
    type: "translation";
    attributes: {
        id: string;
        content: string;
        key_id: string;
        language_id: string;
    };
    relationships: {
        export_config?: { data: any };
        key?: { data: any };
        language?: { data: any };
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
