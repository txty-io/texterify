import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { ILanguageConfig } from "./LanguageConfigsAPI";

export interface IExportConfigRelationships {
    language_configs: {
        data: {
            id: string;
            type: "language_config";
        }[];
    };
    flavor: {
        data: {
            id: string;
            type: "flavor";
        };
    };
    file_format: {
        data: {
            id: string;
            type: "file_format";
        };
    };
}

export interface IExportConfig {
    id: string;
    type: string;
    attributes: {
        id: string;
        name: string;
        file_format_id: string;
        flavor_id: string;
        file_path: string;
        file_path_stringsdict: string;
        default_language_file_path: string;
        default_language_file_path_stringsdict: string;
        split_on: string;
        skip_empty_plural_translations: boolean;
    };
    relationships: IExportConfigRelationships;
}

export interface IGetExportConfigsResponse {
    data: IExportConfig[];
    included: ILanguageConfig[];
    meta: {
        total: number;
    };
}

export interface IGetExportConfigsOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

const ExportConfigsAPI = {
    getExportConfigs: async (options: {
        projectId: string;
        options?: IGetExportConfigsOptions;
    }): Promise<IGetExportConfigsResponse> => {
        return API.getRequest(`projects/${options.projectId}/export_configs`, true, {
            search: options.options && options.options.search,
            page: options.options && options.options.page,
            per_page: options.options && options.options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createExportConfig: async (options: {
        projectId: string;
        fileFormatId: string;
        name: string;
        flavorId: string;
        filePath: string;
        filePathStringsdict: string;
        splitOn: string;
        defaultLanguageFilePath: string;
        defaultLanguageFilePathStringsdict: string;
        skipEmptyPluralTranslations: boolean;
    }) => {
        return API.postRequest(`projects/${options.projectId}/export_configs`, true, {
            name: options.name,
            language_id: options.projectId,
            file_format_id: options.fileFormatId,
            flavor_id: options.flavorId,
            file_path: options.filePath,
            file_path_stringsdict: options.filePathStringsdict,
            default_language_file_path: options.defaultLanguageFilePath,
            default_language_file_path_stringsdict: options.defaultLanguageFilePathStringsdict,
            split_on: options.splitOn,
            skip_empty_plural_translations: options.skipEmptyPluralTranslations
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateExportConfig: async (options: {
        projectId: string;
        exportConfigId: string;
        fileFormatId: string;
        name: string;
        flavorId: string;
        filePath: string;
        filePathStringsdict: string;
        splitOn: string;
        defaultLanguageFilePath: string;
        defaultLanguageFilePathStringsdict: string;
        skipEmptyPluralTranslations: boolean;
    }) => {
        return API.putRequest(`projects/${options.projectId}/export_configs/${options.exportConfigId}`, true, {
            name: options.name,
            language_id: options.projectId,
            file_format_id: options.fileFormatId,
            flavor_id: options.flavorId,
            file_path: options.filePath,
            file_path_stringsdict: options.filePathStringsdict,
            default_language_file_path: options.defaultLanguageFilePath,
            default_language_file_path_stringsdict: options.defaultLanguageFilePathStringsdict,
            split_on: options.splitOn,
            skip_empty_plural_translations: options.skipEmptyPluralTranslations
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteExportConfig: async (options: { projectId: string; exportConfigId: string }) => {
        return API.deleteRequest(`projects/${options.projectId}/export_configs/${options.exportConfigId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteExportConfigs: async (options: { projectId: string; exportConfigIds: string[] }) => {
        return API.deleteRequest(`projects/${options.projectId}/export_configs`, true, {
            export_configs: options.exportConfigIds
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ExportConfigsAPI };
