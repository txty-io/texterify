import { API } from "./API";
import { APIUtils } from "./APIUtils";

const LanguagesAPI = {
  getLanguages: async (projectId: string, options?: any): Promise<any> => {
    return API.getRequest(`projects/${projectId}/languages`, true, {
      search: options && options.search,
      page: options && options.page,
      per_page: options && options.perPage
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
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
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
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
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  updateLanguageParent: async (projectId: string, languageId: string, parent: string): Promise<any> => {
    return API.putRequest(`projects/${projectId}/languages/${languageId}`, true, {
      parent: parent
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  deleteLanguages: async (projectId: string, languages: any[]): Promise<any> => {
    return API.deleteRequest(`projects/${projectId}/languages`, true, {
      languages: languages
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { LanguagesAPI };
