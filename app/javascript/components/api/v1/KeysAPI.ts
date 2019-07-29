import { API } from "./API";
import { APIUtils } from "./APIUtils";

const KeysAPI = {
  getKey: async (projectId: string, keyId: string): Promise<any> => {
    return API.getRequest(`projects/${projectId}/keys/${keyId}`, true, {})
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  getKeys: async (projectId: string, options: { search: string; page: number; perPage: number }): Promise<any> => {
    return API.getRequest(`projects/${projectId}/keys`, true, {
      search: options && options.search || undefined,
      page: options && options.page,
      per_page: options && options.perPage
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  createKey: async (projectId: string, name: string, description: string, htmlEnabled: boolean): Promise<any> => {
    return API.postRequest(`projects/${projectId}/keys`, true, {
      name: name,
      description: description,
      html_enabled: htmlEnabled
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  update: async (projectId: string, keyId: string, name: string, description: string, htmlEnabled: boolean) => {
    return API.putRequest(`projects/${projectId}/keys/${keyId}`, true, {
      name: name,
      description: description,
      html_enabled: htmlEnabled
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  deleteKeys: async (projectId: string, keys: any) => {
    return API.deleteRequest(`projects/${projectId}/keys`, true, {
      keys: keys
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { KeysAPI };
