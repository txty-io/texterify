import { API } from "./API";
import { APIUtils } from "./APIUtils";

const MembersAPI = {
    getMembers: async (projectId: string, options?: { search: string }): Promise<any> => {
        return API.getRequest(`projects/${projectId}/members`, true, {
            search: options && options.search
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createMember: async (projectId: string, email: string): Promise<any> => {
        return API.postRequest(`projects/${projectId}/members`, true, {
            email: email
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteMember: async (projectId: string, userId: string): Promise<any> => {
        return API.deleteRequest(`projects/${projectId}/members/${userId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateMember: async (projectId: string, userId: string, role: string): Promise<any> => {
        return API.putRequest(`projects/${projectId}/members/${userId}`, true, {
            role: role
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { MembersAPI };
