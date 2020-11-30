import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ILicense {
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

export interface IGetLicensesResponse {
    data: ILicense[];
    meta: {
        total: number;
    };
}

const LicensesAPI = {
    getLicenses: async (): Promise<IGetLicensesResponse> => {
        return API.getRequest("licenses", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    }
};

export { LicensesAPI };
