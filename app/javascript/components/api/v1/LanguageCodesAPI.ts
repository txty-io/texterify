import { API } from "./API";
import { APIUtils } from "./APIUtils";

const LanguageCodesAPI = {
    getAll: async () => {
        return API.getRequest(`language_codes`, true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    }
};

export { LanguageCodesAPI };
