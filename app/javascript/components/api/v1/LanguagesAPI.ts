import { authStore } from "../../stores/AuthStore";
import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { ProjectsAPI } from "./ProjectsAPI";

const LanguagesAPI = {
  getLanguages: async (projectId: string, options?: any): Promise<any> => {
    return API.getRequest(`projects/${projectId}/languages`, true, {
      search: options && options.search,
      page: options && options.page,
      per_page: options && options.perPage
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  createLanguage: async (projectId: string, name: string, countryCode: string, parent?: string): Promise<any> => {
    return API.postRequest(`projects/${projectId}/languages`, true, {
      name: name,
      country_code: countryCode,
      parent: parent
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  updateLanguage: async (projectId: string, languageId: string, name: string, countryCode: string, parent?: string): Promise<any> => {
    return API.putRequest(`projects/${projectId}/languages/${languageId}`, true, {
      name: name,
      country_code: countryCode,
      parent: parent
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
