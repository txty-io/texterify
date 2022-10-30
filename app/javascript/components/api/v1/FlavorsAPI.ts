import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { ILanguageConfig } from "./LanguageConfigsAPI";

export interface IFlavor {
    id: string;
    type: string;
    attributes: {
        id: string;
        name: string;
    };
}

export interface IGetFlavorsResponse {
    data: IFlavor[];
    included: ILanguageConfig[];
    meta: {
        total: number;
    };
}

export interface IGetFlavorsOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

const FlavorsAPI = {
    getFlavors: async (options: { projectId: string; options?: IGetFlavorsOptions }): Promise<IGetFlavorsResponse> => {
        return API.getRequest(`projects/${options.projectId}/flavors`, true, {
            search: options.options && options.options.search,
            page: options.options && options.options.page,
            per_page: options.options && options.options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createFlavor: async (options: { projectId: string; name: string }) => {
        return API.postRequest(`projects/${options.projectId}/flavors`, true, {
            name: options.name
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateFlavor: async (options: { projectId: string; flavorId: string; name: string }) => {
        return API.putRequest(`projects/${options.projectId}/flavors/${options.flavorId}`, true, {
            name: options.name
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteFlavor: async (options: { projectId: string; flavorId: string }) => {
        return API.deleteRequest(`projects/${options.projectId}/flavors/${options.flavorId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteFlavors: async (options: { projectId: string; flavorIds: string[] }) => {
        return API.deleteRequest(`projects/${options.projectId}/flavors`, true, {
            flavors: options.flavorIds
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { FlavorsAPI };
