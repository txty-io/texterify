import { API } from "./API";
import { APIUtils } from "./APIUtils";

const OrganizationMembersAPI = {
    getMembers: async (organizationId: string, options?: { search: string }): Promise<any> => {
        return API.getRequest(`organizations/${organizationId}/members`, true, {
            search: options && options.search
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getProjectMembers: async (organizationId: string, options?: { search: string }): Promise<any> => {
        return API.getRequest(`organizations/${organizationId}/project_members`, true, {
            search: options && options.search
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createMember: async (organizationId: string, email: string): Promise<any> => {
        return API.postRequest(`organizations/${organizationId}/members`, true, {
            email: email
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
