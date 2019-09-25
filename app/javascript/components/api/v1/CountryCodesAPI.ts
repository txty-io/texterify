import { API } from "./API";
import { APIUtils } from "./APIUtils";

const CountryCodesAPI = {
  getCountryCodes: async (): Promise<any> => {
    return API.getRequest(`country_codes`, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { CountryCodesAPI };
