import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { IUser } from "./OrganizationMembersAPI";

export interface IImport {
    id: string;
    type: "import";
    attributes: {
        id: string;
        name: string;
        user: string;
        created_at: string;
    };
    relationships: {
        user: {
            data: { id: string; type: "user" };
        };
    };
}

export type IImportIncluded = IUser[];

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

export interface IGetImportResponse {
    data: IImport;
    included: IImportIncluded;
}

export interface ICreateImportResponse {
    data: IImport;
    included: IImportIncluded;
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
