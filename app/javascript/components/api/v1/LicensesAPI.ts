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
        expired: boolean;
        licensee: { name: string; email: string };
        restrictions?: { active_users_count: number };
        starts_at: string;
    };
}

export interface IGetLicensesResponse {
    data: ILicense[];
    meta: {
        total: number;
    };
}

export interface ICurrentLicenseInformation {
    has_license: boolean;
    expires_at: string | null;
}

const LicensesAPI = {
    getLicenses: async (): Promise<IGetLicensesResponse> => {
        return API.getRequest("licenses", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    },

    getCurrentLicenseInfo: async (): Promise<ICurrentLicenseInformation> => {
        return API.getRequest("licenses/current", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
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
