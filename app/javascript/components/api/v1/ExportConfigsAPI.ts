import { API } from "./API";
import { APIUtils } from "./APIUtils";

const ExportConfigsAPI = {
    getExportConfigs: async (options: { projectId: string }) => {
        return API.getRequest(`projects/${options.projectId}/export_configs`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createExportConfig: async (options: {
        projectId: string;
        fileFormat: string;
        name: string;
        filePath: string;
        defaultLanguageFilePath: string;
    }) => {
        return API.postRequest(`projects/${options.projectId}/export_configs`, true, {
            name: options.name,
            language_id: options.projectId,
            file_format: options.fileFormat,
            file_path: options.filePath,
            default_language_file_path: options.defaultLanguageFilePath
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateExportConfig: async (options: {
        projectId: string;
        exportConfigId: string;
        fileFormat: string;
        name: string;
        filePath: string;
        defaultLanguageFilePath: string;
    }) => {
        return API.putRequest(`projects/${options.projectId}/export_configs/${options.exportConfigId}`, true, {
            name: options.name,
            language_id: options.projectId,
            file_format: options.fileFormat,
            file_path: options.filePath,
            default_language_file_path: options.defaultLanguageFilePath
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteExportConfig: async (options: { projectId: string; exportConfigId: string }) => {
        return API.deleteRequest(`projects/${options.projectId}/export_configs/${options.exportConfigId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ExportConfigsAPI };
