import { IOrganization } from "../../stores/DashboardStore";
import { IPlanIDS } from "../../types/IPlan";
import { IErrorsResponse } from "../../ui/ErrorUtils";
import { API } from "./API";
import { APIUtils, IGenericAPIResponse } from "./APIUtils";
import { IProject } from "./ProjectsAPI";

export interface IGetOrganizationsOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

export interface IGetOrganizationsResponse {
    data: IOrganization[];
    included: [];
    meta: {
        total: number;
    };
}

export interface IGetOrganizationResponse {
    data: IOrganization;
    included: IProject[];
    errors?: IErrorsResponse;
}

export type IUpdateOrganizationResponse = IGetOrganizationResponse & { errors: IErrorsResponse };
export type ICreateOrganizationResponse = IGetOrganizationResponse & { errors: IErrorsResponse };

export interface ICustomSubscription {
    id: string;
    type: "custom_subscription";
    attributes: {
        id: string;
        plan: IPlanIDS;
        provider: string;
        provider_plan: string;
        provider_license_key: string;
        max_users: number;
        machine_translation_character_limit: number;
        ends_at: string;
    };
}

export interface ISubscription {
    id: string;
    type: "subscription";
    attributes: {
        active: boolean;
        id: string;
        plan: IPlanIDS;
        renews_or_cancels_on: string;
        users_count: number;
        invoice_upcoming_total: number;
        canceled: boolean;
    };
}

export interface IGetOrganizationCustomSubscription {
    data: ICustomSubscription;
}

export interface IGetOrganizationSubscription {
    data: ISubscription;
}

const OrganizationsAPI = {
    getOrganizations: async (options?: IGetOrganizationsOptions): Promise<IGetOrganizationsResponse> => {
        return API.getRequest("organizations", true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getOrganization: async (organizationId: string): Promise<IGetOrganizationResponse> => {
        return API.getRequest(`organizations/${organizationId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getOrganizationCustomSubscription: async (organizationId: string): Promise<IGetOrganizationCustomSubscription> => {
        return API.getRequest(`organizations/${organizationId}/custom_subscription`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    activateCustomSubscription: async (options: {
        organizationId: string;
        customSubscriptionId: string;
    }): Promise<IGenericAPIResponse> => {
        return API.postRequest(`organizations/${options.organizationId}/activate_custom_subscription`, true, {
            id: options.customSubscriptionId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getOrganizationSubscription: async (organizationId: string): Promise<IGetOrganizationSubscription> => {
        return API.getRequest(`organizations/${organizationId}/subscription`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    cancelOrganizationSubscription: async (organizationId: string): Promise<void> => {
        return API.deleteRequest(`organizations/${organizationId}/cancel_subscription`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    changeOrganizationSubscriptionPlan: async (organizationId: string, planId: IPlanIDS): Promise<void> => {
        return API.putRequest(`organizations/${organizationId}/change_subscription_plan?plan=${planId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    reactivateOrganizationSubscription: async (organizationId: string): Promise<void> => {
        return API.postRequest(`organizations/${organizationId}/reactivate_subscription`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createOrganization: async (name: string, description: string): Promise<ICreateOrganizationResponse> => {
        return API.postRequest("organizations", true, {
            name: name,
            description: description
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateOrganization: async (
        organizationId: string,
        name: string,
        description: string
    ): Promise<IUpdateOrganizationResponse> => {
        return API.putRequest(`organizations/${organizationId}`, true, {
            name: name,
            description: description
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateMachineTranslationSettings: async (options: {
        organizationId: string;
        deeplAPIToken: string;
    }): Promise<IUpdateOrganizationResponse> => {
        return API.putRequest(`organizations/${options.organizationId}/machine_translation`, true, {
            deepl_api_token: options.deeplAPIToken
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteOrganization: async (organizationId: string) => {
        return API.deleteRequest(`organizations/${organizationId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getImage: async (options: { organizationId: string }): Promise<any> => {
        return API.getRequest(`organizations/${options.organizationId}/image`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteImage: async (options: { organizationId: string }): Promise<any> => {
        return API.deleteRequest(`organizations/${options.organizationId}/image`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    uploadImage: async (options: { organizationId: string; formData: FormData }): Promise<any> => {
        return API.postRequest(`organizations/${options.organizationId}/image`, true, options.formData, null, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { OrganizationsAPI };
