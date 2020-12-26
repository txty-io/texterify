import { IPlan } from "../../types/IPlan";
import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IGetOrganizationsOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

export interface ISubscription {
    id: string;
    type: "subscription";
    attributes: {
        active: boolean;
        id: string;
        plan: IPlan;
        renews_or_cancels_on: string;
        users_count: number;
        invoice_upcoming_total: number;
        canceled: boolean;
    };
}

export interface IGetOrganizationSubscription {
    data: ISubscription;
}

const OrganizationsAPI = {
    getOrganizations: async (options?: IGetOrganizationsOptions): Promise<any> => {
        return API.getRequest("organizations", true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getOrganization: async (organizationId: string): Promise<any> => {
        return API.getRequest(`organizations/${organizationId}`, true)
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

    reactivateOrganizationSubscription: async (organizationId: string): Promise<void> => {
        return API.postRequest(`organizations/${organizationId}/reactivate_subscription`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createOrganization: async (name: string, description: string): Promise<any> => {
        return API.postRequest("organizations", true, {
            name: name,
            description: description
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateOrganization: async (organizationId: string, name: string, description: string): Promise<any> => {
        return API.putRequest(`organizations/${organizationId}`, true, {
            name: name,
            description: description
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
