import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IInstanceInfo {
    users_count: number;
    projects_count: number;
    organizations_count: number;
}

const InstanceAPI = {
    getInstanceInfos: async (): Promise<IInstanceInfo> => {
        return API.getRequest("instance", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    }
};

export { InstanceAPI };
