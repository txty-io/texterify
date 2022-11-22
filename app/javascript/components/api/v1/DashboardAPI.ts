import { API } from "./API";
import { APIUtils } from "./APIUtils";

const DashboardAPI = {
    getActivity: async (options: { limit?: number }): Promise<any> => {
        return API.getRequest("dashboard/activity", true, {
            limit: options.limit
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },
    getChangelog: async (): Promise<{ changelog: string }> => {
        return API.getRequest("dashboard/changelog", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    }
};

export { DashboardAPI };
