import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IUserLicense {
    id: string;
    type: "license";
    attributes: {
        id: string;
        data: string;
        expires_at: string;
        licensee: { name: string; email: string };
        restrictions: { active_users_count: number };
        starts_at: string;
    };
}

export interface IGetUsersLicensesResponse {
    data: IUserLicense[];
    meta: {
        total: number;
    };
}

const UserLicensesAPI = {
    getLicenses: async (): Promise<IGetUsersLicensesResponse> => {
        return API.getRequest("user_licenses", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    }
};

export { UserLicensesAPI };
