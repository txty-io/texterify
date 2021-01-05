import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ILicense {
    id: string;
    type: "license";
    attributes: {
        id: string;
        data: string;
        expires_at: string;
        plan: "team" | "business";
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
    },

    uploadLicense: async (options: { file: File }): Promise<ILicense> => {
        const data = new FormData();
        data.append("data_file", options.file);

        return API.postRequest("licenses", true, data, null, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { LicensesAPI };
