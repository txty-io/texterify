import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { IBackgroundJob } from "./BackgroundJobsAPI";
import { IUser } from "./OrganizationMembersAPI";

export interface IImport {
    id: string;
    type: "import";
    attributes: {
        id: string;
        name: string;
        user: string;
        created_at: string;
        status: "CREATED" | "VERIFYING" | "VERIFIED" | "IMPORTING" | "IMPORTED" | "ERROR";
        project_id: string;
        error_message: string;
    };
    relationships: {
        user: {
            data: { id: string; type: "user" };
            import_files: { id: string; type: "import_file" }[];
        };
    };
}

export interface IImportFile {
    id: string;
    type: "import_file";
    attributes: {
        id: string;
        name: string;
        status: "CREATED" | "ERROR" | "VERIFIED";
        status_message: "ERROR_WHILE_PARSING" | "UNKNOWN_ERROR";
        error_message: string;
    };
}

export type IImportIncluded = (IUser | IImportFile)[];

export interface IGetImportsOptions {
    projectId: string;
    search?: string;
    page?: number;
    perPage?: number;
}

export interface IGetImportsResponse {
    data: IImport[];
    included: IImportIncluded;
    meta: { total: number };
}

export interface IGetImportOptions {
    projectId: string;
    importId: string;
}

export interface IGetImportReviewOptions {
    projectId: string;
    importId: string;
}

export interface IGetImportImportFilesOptions {
    projectId: string;
    importId: string;
}

export interface IGetImportImportOptions {
    projectId: string;
    importId: string;
}

export interface IGetImportResponse {
    data: IImport;
    included: IImportIncluded;
}

export interface IGetImportFilesResponse {
    data: IImportFile[];
}

export interface IImportReviewResponse {
    imported_files: { data: IImportFile[] };
    new_translations: {
        [k: string]: {
            [k: string]: {
                new_translation: boolean;
                old: {
                    other: string;
                    zero: string;
                    one: string;
                    two: string;
                    few: string;
                    many: string;
                    description: string;
                };
                new: {
                    other: string;
                    zero: string;
                    one: string;
                    two: string;
                    few: string;
                    many: string;
                    description: string;
                };
            };
        };
    };
}

export interface IImportImportResponse {
    error: boolean;
    message: string;
    background_job: IBackgroundJob;
}

export interface ICreateImportResponse {
    data: IImport;
    included: IImportIncluded;
}

export interface IVerifyImportOptions {
    projectId: string;
    importId: string;
    fileLanguageAssignments: { [k: string]: string };
    fileFormatAssignments: { [k: string]: string };
}

export interface IVerifyImportResponse {
    error: boolean;
    message: string;
    background_job: IBackgroundJob;
}

const ImportsAPI = {
    get: async (options: IGetImportsOptions): Promise<IGetImportsResponse> => {
        return API.getRequest(`projects/${options.projectId}/imports`, true, {
            search: options.search,
            page: options.page,
            per_page: options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    detail: async (options: IGetImportOptions): Promise<IGetImportResponse> => {
        return API.getRequest(`projects/${options.projectId}/imports/${options.importId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    review: async (options: IGetImportReviewOptions): Promise<IImportReviewResponse> => {
        return API.getRequest(`projects/${options.projectId}/imports/${options.importId}/review`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getImportFiles: async (options: IGetImportImportFilesOptions): Promise<IGetImportFilesResponse> => {
        return API.getRequest(`projects/${options.projectId}/imports/${options.importId}/import_files`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    import: async (options: IGetImportImportOptions): Promise<IImportImportResponse> => {
        return API.postRequest(`projects/${options.projectId}/imports/${options.importId}/import`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    verify: async (options: IVerifyImportOptions): Promise<IVerifyImportResponse> => {
        return API.postRequest(`projects/${options.projectId}/imports/${options.importId}/verify`, true, {
            file_language_assignments: options.fileLanguageAssignments,
            file_format_assignments: options.fileFormatAssignments
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    create: async (data: {
        projectId: string;
        languageId?: string;
        flavorId?: string;
        files: File[];
    }): Promise<ICreateImportResponse> => {
        const formData = new FormData();
        formData.append("language_id", data.languageId);
        formData.append("flavor_id", data.flavorId);
        data.files.forEach((file) => {
            formData.append("files[]", file);
        });

        return API.postRequest(`projects/${data.projectId}/imports`, true, formData, undefined, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    delete: async (options: { projectId: string; importIds: string[] }): Promise<any> => {
        return API.deleteRequest(`projects/${options.projectId}/imports`, true, {
            import_ids: options.importIds
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ImportsAPI };
