import { API } from "./API";
import { APIUtils, IGenericAPIResponse } from "./APIUtils";

export interface IOrganizationInvite {
    id: string;
    attributes: {
        id: string;
        email: string;
        role: string;
        created_at: string;
        organization_id: string;
    };
    relationships: any;
    type: string;
}

export interface IGetOrganizationInvitesResponse {
    data: IOrganizationInvite[];
    included: [];
    meta: {
        total: number;
    };
}

const OrganizationInvitesAPI = {
    create: async (options: { organizationId: string; email: string; role?: string }): Promise<IGenericAPIResponse> => {
        return API.postRequest(`organizations/${options.organizationId}/invites`, true, {
            email: options.email,
            role: options.role
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getAll: async (options: { organizationId: string }): Promise<IGetOrganizationInvitesResponse> => {
        return API.getRequest(`organizations/${options.organizationId}/invites`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    delete: async (options: { organizationId: string; inviteId: string }): Promise<IGenericAPIResponse> => {
        return API.deleteRequest(`organizations/${options.organizationId}/invites/${options.inviteId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { OrganizationInvitesAPI };
