import { API } from "./API";
import { APIUtils } from "./APIUtils";

const TranslationsAPI = {
  createTranslation: async (projectId: string, languageId: string, keyId: string, content: string): Promise<any> => {
    return API.postRequest(`projects/${projectId}/translations`, true, {
      language_id: languageId,
      key_id: keyId,
      translation: {
        content: content
      }
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  updateTranslation: async (projectId: string, translationId: string, content: string): Promise<any> => {
    return API.putRequest(`projects/${projectId}/translations/${translationId}`, true, {
      translation: {
        content: content
      }
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { TranslationsAPI };
