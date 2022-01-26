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
    email_confirmation_required: boolean;
    sign_up_enabled: boolean;
    domain_filter: string;
}

const InstanceAPI = {
    getInstanceInfos: async (): Promise<IInstanceInfo> => {
        return API.getRequest("instance", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    },

    saveDomainFilter: async (options: { domainFilter: string }): Promise<void> => {
        return API.putRequest("instance/domain-filter", true, {
            domain_filter: options.domainFilter
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    setSignUpEnabled: async (options: { signUpEnabled: boolean }): Promise<void> => {
        return API.putRequest("instance/sign-up-enabled", true, {
            sign_up_enabled: options.signUpEnabled
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { InstanceAPI };
