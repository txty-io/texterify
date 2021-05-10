import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IGetMachineTranslationsUsage {
    character_count: number;
    character_limit: number;
}

export interface IGetMachineTranslation {
    translation: string;
}

const MachineTranslationsAPI = {
    getUsage: async (): Promise<IGetMachineTranslationsUsage> => {
        return API.getRequest("machine_translations_usage", true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },
    translate: async (options: {
        projectId: string;
        translationId: string;
        targetLanguageId: string;
    }): Promise<IGetMachineTranslation> => {
        return API.postRequest(`projects/${options.projectId}/translations/${options.translationId}/translate`, true, {
            language_id: options.targetLanguageId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { MachineTranslationsAPI };
