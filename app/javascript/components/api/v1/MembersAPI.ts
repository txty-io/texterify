import { authStore } from "../../stores/AuthStore";
import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { ProjectsAPI } from "./ProjectsAPI";

const MembersAPI = {
  getMembers: async (projectId: string): Promise<any> => {
    return API.getRequest(`projects/${projectId}/members`, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  createMember: async (projectId: string, email: string): Promise<any> => {
    return API.postRequest(`projects/${projectId}/members`, true, {
      email: email
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  deleteMember: async (projectId: string, userId: string): Promise<any> => {
    return API.deleteRequest(`projects/${projectId}/members/${userId}`, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { MembersAPI };
