import { API } from "./API";
import { APIUtils } from "./APIUtils";

const ProjectColumnsAPI = {
    getProjectColumns: async (options: { projectId: string }): Promise<any> => {
        return API.getRequest(`projects/${options.projectId}/project_columns`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateProjectColumn: async (options: {
        projectId: string;
        languages: string[];
        showName: boolean;
        showDescription?: boolean;
    }): Promise<any> => {
        return API.putRequest(`projects/${options.projectId}/project_columns`, true, {
            languages: options.languages,
            show_name: options.showName,
            show_description: options.showDescription
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ProjectColumnsAPI };
