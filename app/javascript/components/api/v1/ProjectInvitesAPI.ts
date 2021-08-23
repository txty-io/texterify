import { API } from "./API";
import { APIUtils, IGenericAPIResponse } from "./APIUtils";

export interface IProjectInvite {
    id: string;
    attributes: {
        id: string;
        email: string;
        role: string;
        created_at: string;
        project_id: string;
    };
    relationships: any;
    type: string;
}

export interface IGetProjectInvitesResponse {
    data: IProjectInvite[];
    included: [];
    meta: {
        total: number;
    };
}

const ProjectInvitesAPI = {
    create: async (options: { projectId: string; email: string; role?: string }): Promise<IGenericAPIResponse> => {
        return API.postRequest(`projects/${options.projectId}/invites`, true, {
            email: options.email,
            role: options.role
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getAll: async (options: { projectId: string }): Promise<IGetProjectInvitesResponse> => {
        return API.getRequest(`projects/${options.projectId}/invites`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    delete: async (options: { projectId: string; inviteId: string }): Promise<IGenericAPIResponse> => {
        return API.deleteRequest(`projects/${options.projectId}/invites/${options.inviteId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ProjectInvitesAPI };
