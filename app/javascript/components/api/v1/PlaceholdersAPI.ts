import { API } from "./API";
import { APIUtils } from "./APIUtils";

const PlaceholdersAPI = {
    checkPlaceholders: async (options: { projectId: string }) => {
        return API.postRequest(`projects/${options.projectId}/placeholders_check`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { PlaceholdersAPI };
