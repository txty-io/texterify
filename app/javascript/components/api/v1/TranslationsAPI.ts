import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ITranslation {
    id: string;
    type: "translation";
    attributes: {
        id: string;
        key_id: string;
        language_id: string;
        zero: string;
        one: string;
        two: string;
        few: string;
        many: string;
        content: string; // other
        created_at: string;
    };
    relationships: {
        flavor?: { data: any };
        key?: { data: any };
        language?: { data: any };
    };
}

const TranslationsAPI = {
    createTranslation: async (options: {
        projectId: string;
        languageId: string;
        keyId: string;
        zero?: string;
        one?: string;
        two?: string;
        few?: string;
        many?: string;
        content: string; // other
        flavorId?: string;
        triggerAutoTranslate?: boolean;
    }) => {
        return API.postRequest(`projects/${options.projectId}/translations`, true, {
            language_id: options.languageId,
            key_id: options.keyId,
            translation: {
                zero: options.zero,
                one: options.one,
                two: options.two,
                few: options.few,
                many: options.many,
                content: options.content
            },
            flavor_id: options.flavorId,
            trigger_auto_translate: options.triggerAutoTranslate
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { TranslationsAPI };
