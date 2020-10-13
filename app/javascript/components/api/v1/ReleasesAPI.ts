import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IReleaseRelationships {
    export_config: {
        data: {
            id: string;
            type: "export_config";
        };
    };
}

export interface IRelease {
    id: string;
    type: string;
    attributes: {
        id: string;
        from_version: string;
        to_version: string;
        url: string;
    };
    relationships: IReleaseRelationships;
}

export interface IGetReleasesResponse {
    data: IRelease[];
    included: any[];
    meta: {
        total: number;
    };
}

export interface IGetReleasesOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

const ReleasesAPI = {
    createRelease: async (options: { projectId: string; exportConfigId: string }) => {
        return API.postRequest(`projects/${options.projectId}/export_configs/${options.exportConfigId}/releases`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getReleases: async (options: {
        projectId: string;
        search?: string;
        page?: number;
        perPage?: number;
    }): Promise<IGetReleasesResponse> => {
        return API.getRequest(`projects/${options.projectId}/releases`, true, {
            search: options.search,
            page: options.page,
            per_page: options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ReleasesAPI };
