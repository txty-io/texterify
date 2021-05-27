import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ILanguageCode {
    id: string;
    type: "language_code";
    attributes: { id: string; name: string; code: string };
}

export interface ILanguage {
    id: string;
    type: "language";
    attributes: {
        id: string;
        name: string;
        is_default: boolean;
        progress: number;
    };
    relationships: {
        country_code: { data: null | { id: string; type: "country_code" } };
        language_code: { data: null | { id: string; type: "language_code" } };
        parent: { data: null | { id: string; type: "language" } };
    };
}

export interface IGetLanguagesResponse {
    data: ILanguage[];
    included: ILanguageCode[];
    meta: { total: number };
}

export interface IGetLanguagesOptions {
    search: string;
    page: number;
    perPage: number;
}

const LanguagesAPI = {
    getLanguages: async (projectId: string, options?: IGetLanguagesOptions): Promise<IGetLanguagesResponse> => {
        return API.getRequest(`projects/${projectId}/languages`, true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createLanguage: async (options: {
        projectId: string;
        name: string;
        countryCode: string;
        languageCode: string;
        parent?: string;
        isDefault?: boolean;
    }) => {
        return API.postRequest(`projects/${options.projectId}/languages`, true, {
            name: options.name,
            country_code: options.countryCode,
            language_code: options.languageCode,
            parent: options.parent,
            is_default: options.isDefault
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateLanguage: async (options: {
        projectId: string;
        languageId: string;
        name: string;
        countryCode: string;
        languageCode: string;
        parent?: string;
        isDefault?: boolean;
    }) => {
        return API.putRequest(`projects/${options.projectId}/languages/${options.languageId}`, true, {
            name: options.name,
            country_code: options.countryCode,
            language_code: options.languageCode,
            parent: options.parent,
            is_default: options.isDefault
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateLanguageParent: async (projectId: string, languageId: string, parent: string): Promise<any> => {
        return API.putRequest(`projects/${projectId}/languages/${languageId}`, true, {
            parent: parent
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteLanguages: async (projectId: string, languages: any[]): Promise<any> => {
        return API.deleteRequest(`projects/${projectId}/languages`, true, {
            languages: languages
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { LanguagesAPI };
