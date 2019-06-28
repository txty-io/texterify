import fileDownload from "js-file-download";
import { API } from "./API";
import { APIUtils } from "./APIUtils";

function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
  });
}

const ProjectsAPI = {
  getProjects: async (options: any): Promise<any> => {
    return API.getRequest("projects", true, {
      search: options && options.search,
      page: options && options.page,
      per_page: options && options.perPage
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  getProject: async (projectId: string): Promise<any> => {
    return API.getRequest(`projects/${projectId}`, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  createProject: async (name: string, description: string): Promise<any> => {
    return API.postRequest(`projects`, true, {
      name: name,
      description: description
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  updateProject: async (projectId: string, name: string, description: string): Promise<any> => {
    return API.putRequest(`projects/${projectId}`, true, {
      name: name,
      description: description
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  export: async (projectId: string, fileName: string, exportType: string) => {
    const response = await API.getRequest(`projects/${projectId}/export`, true, {
      export_type: exportType
    }, null, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);

    if (response.status === 200) {
      const zip = await response.blob();
      fileDownload(zip, `${fileName}.zip`);
    }

    return response;
  },

  import: async (projectId: string, languageId: string, file: any) => {
    const fileBase64 = await getBase64(file);

    return API.postRequest(`projects/${projectId}/import`, true, {
      language_id: languageId,
      file: fileBase64
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  deleteProject: async (projectId: string) => {
    return API.deleteRequest(`projects/${projectId}`, true)
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  getActivity: async (options: { projectId: string; limit?: number }) => {
    return API.getRequest(`projects/${options.projectId}/activity`, true, {
      limit: options.limit
    })
      .then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { ProjectsAPI };
