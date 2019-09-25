import { authStore } from "../../stores/AuthStore";
import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { ProjectsAPI } from "./ProjectsAPI";

const LanguageCodesAPI = {
  getAll: async () => {
    return API.getRequest(`language_codes`, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { LanguageCodesAPI };
