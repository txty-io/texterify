import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IInstanceInfo {
    users_count: number;
    projects_count: number;
    organizations_count: number;
    languages_count: number;
    keys_count: number;
    translations_count: number;
    releases_count: number;
    is_cloud: number;
    sidekiq_processes: number;
}

const InstanceAPI = {
    getInstanceInfos: async (): Promise<IInstanceInfo> => {
        return API.getRequest("instance", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    }
};

export { InstanceAPI };
