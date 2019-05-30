import { authStore } from "../../stores/AuthStore";
import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { ProjectsAPI } from "./ProjectsAPI";

const CountryCodesAPI = {
  getCountryCodes: async (): Promise<any> => {
    return API.getRequest(`country_codes`, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { CountryCodesAPI };
