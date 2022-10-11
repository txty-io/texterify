import fileDownload from "js-file-download";
import { ImportFileFormats } from "../../sites/dashboard/FileImportSite";
import { IFeature } from "../../types/IFeature";
import { IPlanIDS } from "../../types/IPlan";
import { IUserRole } from "../../types/IUserRole";
import { IErrorsResponse } from "../../ui/ErrorUtils";
import { API } from "./API";
import { APIUtils } from "./APIUtils";

interface IProjectAttributes {
    id: string;
    name: string;
    description: string;
    current_user_role?: IUserRole;
    current_user_role_source?: "project" | "organization";
    enabled_features: IFeature[];
    all_features: { [k in IFeature]: IPlanIDS[] };
    machine_translation_active: boolean;
    machine_translation_enabled: boolean;
    machine_translation_character_usage: number;
    auto_translate_new_keys: boolean;
    auto_translate_new_languages: boolean;
    word_count: number;
    character_count: number;
    placeholder_start: string;
    placeholder_end: string;
    issues_count: number;
    validate_leading_whitespace: boolean;
    validate_trailing_whitespace: boolean;
    validate_double_whitespace: boolean;
    validate_https: boolean;
    current_user_deactivated?: boolean;
    current_user_deactivated_reason?: "manually_by_admin" | "user_limit_exceeded";
    current_user_in_project_organization?: boolean;
    current_user_in_project?: boolean;
    organization_id: string;
}

export interface IProject {
    id: string;
    attributes: IProjectAttributes;
    relationships: any;
    type: string;
}

export interface IGetProjects {
    data: {
        id: string;
        type: "project";
        attributes: IProjectAttributes;
        relationships: any;
    }[];
    meta: {
        total: number;
    };
}

export interface IGetProjectResponse {
    data: IProject;
    included: [];
    errors?: IErrorsResponse;
}

export type IUpdateProjectResponse = IGetProjectResponse & { errors: IErrorsResponse; error: any; message: any };
export type ICreateProjectResponse = IGetProjectResponse & { errors: IErrorsResponse; error: any; message: any };

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

export interface IGetProjectsOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

const ProjectsAPI = {
    getProjects: async (options?: IGetProjectsOptions): Promise<IGetProjects> => {
        return API.getRequest("projects", true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getProject: async (projectId: string): Promise<IGetProjectResponse> => {
        return API.getRequest(`projects/${projectId}`, true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    },

    createProject: async (
        name: string,
        description: string,
        organizationId?: string
    ): Promise<ICreateProjectResponse> => {
        return API.postRequest("projects", true, {
            name: name,
            description: description,
            organization_id: organizationId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateProject: async (options: {
        projectId: string;
        name?: string;
        description?: string;
        validateLeadingWhitespace?: boolean;
        validateTrailingWhitespace?: boolean;
        validateDoubleWhitespace?: boolean;
        validateHTTPS?: boolean;
        machineTranslationEnabled?: boolean;
        autoTranslateNewKeys?: boolean;
        autoTranslateNewLanguages?: boolean;
    }): Promise<IUpdateProjectResponse> => {
        return API.putRequest(`projects/${options.projectId}`, true, {
            name: options.name,
            description: options.description,
            validate_leading_whitespace: options.validateLeadingWhitespace,
            validate_trailing_whitespace: options.validateTrailingWhitespace,
            validate_double_whitespace: options.validateDoubleWhitespace,
            validate_https: options.validateHTTPS,
            machine_translation_enabled: options.machineTranslationEnabled,
            auto_translate_new_keys: options.autoTranslateNewKeys,
            auto_translate_new_languages: options.autoTranslateNewLanguages
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateProjectPlaceholderSettings: async (options: {
        projectId: string;
        placeholderStart: string;
        placeholderEnd: string;
    }) => {
        return API.putRequest(`projects/${options.projectId}`, true, {
            placeholder_start: options.placeholderStart,
            placeholder_end: options.placeholderEnd
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

    import: async (options: {
        projectId: string;
        languageId: string;
        file: any;
        flavorId: string;
        fileFormat: ImportFileFormats;
    }) => {
        const fileBase64 = await getBase64(options.file);

        return API.postRequest(`projects/${options.projectId}/import`, true, {
            language_id: options.languageId,
            flavor_id: options.flavorId,
            name: options.file.name,
            file: fileBase64,
            file_format: options.fileFormat
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
    },

    getRecentlyViewedProjects: async (): Promise<any> => {
        return API.getRequest("recently_viewed_projects", true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ProjectsAPI };
