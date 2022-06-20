import { API } from "./API";
import { APIUtils, IGenericAPIResponse } from "./APIUtils";

export interface IGetMachineTranslationsUsage {
    character_count: number;
    character_limit: number;
}

export interface IGetMachineTranslationSuggestion {
    translation: string;
}

export interface IGetMachineTranslationsSourceLanguages {
    data: {
        id: string;
        type: "deepl_target_language";
        attributes: { id: string; name: string; language_code: string; country_code: string };
    }[];
}

export interface IGetMachineTranslationsTargetLanguages {
    data: {
        id: string;
        type: "deepl_target_language";
        attributes: { id: string; name: string; language_code: string; country_code: string };
    }[];
}

const MachineTranslationsAPI = {
    getUsage: async (): Promise<IGetMachineTranslationsUsage> => {
        return API.getRequest("machine_translations_usage", true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    machineTranslationSuggestion: async (options: {
        projectId: string;
        translationId: string;
        targetLanguageId: string;
    }): Promise<IGetMachineTranslationSuggestion> => {
        return API.postRequest(
            `projects/${options.projectId}/translations/${options.translationId}/machine_translation_suggestion`,
            true,
            {
                language_id: options.targetLanguageId
            }
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    translateLanguage: async (options: { projectId: string; languageId: string }): Promise<IGenericAPIResponse> => {
        return API.postRequest(`projects/${options.projectId}/languages/${options.languageId}/machine_translate`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getSourceLanguages: async (): Promise<IGetMachineTranslationsSourceLanguages> => {
        return API.getRequest("machine_translations_source_languages", true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getTargetLanguages: async (): Promise<IGetMachineTranslationsTargetLanguages> => {
        return API.getRequest("machine_translations_target_languages", true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { MachineTranslationsAPI };
