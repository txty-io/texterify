import fileDownload from "js-file-download";
import { API } from "./API";
import { APIUtils } from "./APIUtils";

async function getBase64(file: any) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve((reader.result as string).split(",")[1]);
        };
        reader.onerror = reject;
    });
}

const ProjectsAPI = {
    getProjects: async (options: any): Promise<any> => {
        return API.getRequest("projects", true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getProject: async (projectId: string): Promise<any> => {
        return API.getRequest(`projects/${projectId}`, true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    },

    createProject: async (name: string, description: string, organizationId?: string): Promise<any> => {
        return API.postRequest("projects", true, {
            name: name,
            description: description,
            organization_id: organizationId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateProject: async (projectId: string, name: string, description: string): Promise<any> => {
        return API.putRequest(`projects/${projectId}`, true, {
            name: name,
            description: description
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    export: async (options: { projectId: string; exportConfigId: string; fileName: string }) => {
        const response = await API.getRequest(
            `projects/${options.projectId}/exports/${options.exportConfigId}`,
            true,
            null,
            null,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);

        if (response.status === 200) {
            const zip = await response.blob();
            fileDownload(zip, `${options.fileName}.zip`);
        }

        return response;
    },

    import: async (options: { projectId: string; languageId: string; file: any; exportConfigId: string }) => {
        const fileBase64 = await getBase64(options.file);

        return API.postRequest(`projects/${options.projectId}/import`, true, {
            language_id: options.languageId,
            export_config_id: options.exportConfigId,
            name: options.file.name,
            file: fileBase64
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteProject: async (projectId: string) => {
        return API.deleteRequest(`projects/${projectId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    transferProject: async (options: { projectId: string; organizationId: string }) => {
        return API.postRequest(`projects/${options.projectId}/transfer`, true, {
            organization_id: options.organizationId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getActivity: async (options: { projectId: string; limit?: number }) => {
        return API.getRequest(`projects/${options.projectId}/activity`, true, {
            limit: options.limit
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getImage: async (options: { projectId: string }): Promise<any> => {
        return API.getRequest(`projects/${options.projectId}/image`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteImage: async (options: { projectId: string }): Promise<any> => {
        return API.deleteRequest(`projects/${options.projectId}/image`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    uploadImage: async (options: { projectId: string; formData: FormData }): Promise<any> => {
        return API.postRequest(`projects/${options.projectId}/image`, true, options.formData, null, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ProjectsAPI };
