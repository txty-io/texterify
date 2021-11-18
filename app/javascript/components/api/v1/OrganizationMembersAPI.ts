import { IOrganization } from "../../stores/DashboardStore";
import { IUserRole } from "../../types/IUserRole";
import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { IProject } from "./ProjectsAPI";

export interface IGetUserResponse {
    data: IUser[];
    included: any[];
}

export type IUserRoleSource = "project" | "organization";

export interface IUser {
    id: string;
    type: "user";
    attributes: {
        id: string;
        username: string;
        email: string;
        boolean: true;
        deactivated: boolean;
        deactivated_reason: string;
        role: IUserRole;
        role_organization: IUserRole;
        role_source: IUserRoleSource;
        user_deactivated_for_project?: boolean;
    };
}

export interface IGetUsersResponse {
    data: IUser[];
}

export interface IGetProjectUsersResponse {
    data: IProjectUser[];
    included: (IUser | IProject)[];
}

export interface IProjectUser {
    id: string;
    type: "user";
    attributes: {
        id: string;
        role: IUserRole;
        deactivated: boolean;
        deactivated_reason: string;
        user_id: string;
        project_id: string;
    };
    relationships: {
        user: { data: null | { id: string; type: "user" } };
        project: { data: null | { id: string; type: "project" } };
    };
}

export interface IGetOrganizationUsersResponse {
    data: IOrganizationUser[];
    included: (IUser | IOrganization)[];
}

export interface IOrganizationUser {
    id: string;
    type: "organization_user";
    attributes: {
        id: string;
        role: string;
        deactivated: boolean;
        deactivated_reason: string;
    };
    relationships: {
        user: { data: null | { id: string; type: "user" } };
        project: { data: null | { id: string; type: "organization" } };
    };
}

const OrganizationMembersAPI = {
    getMembers: async (
        organizationId: string,
        options?: { search: string }
    ): Promise<IGetOrganizationUsersResponse> => {
        return API.getRequest(`organizations/${organizationId}/members`, true, {
            search: options && options.search
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getProjectMembers: async (
        organizationId: string,
        options?: { search: string }
    ): Promise<IGetProjectUsersResponse> => {
        return API.getRequest(`organizations/${organizationId}/project_members`, true, {
            search: options && options.search
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createMember: async (organizationId: string, email: string, role: IUserRole): Promise<any> => {
        return API.postRequest(`organizations/${organizationId}/members`, true, {
            email: email,
            role: role
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteMember: async (organizationId: string, userId: string): Promise<any> => {
        return API.deleteRequest(`organizations/${organizationId}/members/${userId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateMember: async (organizationId: string, userId: string, role: string): Promise<any> => {
        return API.putRequest(`organizations/${organizationId}/members/${userId}`, true, {
            role: role
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { OrganizationMembersAPI };
