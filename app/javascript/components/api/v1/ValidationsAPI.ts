import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IValidation {
    id: string;
    type: "validation";
    attributes: {
        id: string;
        name: string;
        description: string;
        match: string;
        content: string;
        enabled: boolean;
    };
}

export interface IGetValidationsResponse {
    data: IValidation[];
    meta: { total: number };
}

export interface IGetValidationsOptions {
    page?: number;
    perPage?: number;
}

const ValidationsAPI = {
    getValidations: async (projectId: string, options?: IGetValidationsOptions): Promise<IGetValidationsResponse> => {
        return API.getRequest(`projects/${projectId}/validations`, true, {
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createValidation: async (options: {
        projectId: string;
        name: string;
        description: string;
        match: string;
        content: string;
    }) => {
        return API.postRequest(`projects/${options.projectId}/validations`, true, {
            name: options.name,
            description: options.description,
            match: options.match,
            content: options.content
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateValidation: async (options: {
        projectId: string;
        validationId: string;
        name?: string;
        description?: string;
        match?: string;
        content?: string;
        enabled?: boolean;
    }) => {
        return API.putRequest(`projects/${options.projectId}/validations/${options.validationId}`, true, {
            name: options.name,
            description: options.description,
            match: options.match,
            content: options.content,
            enabled: options.enabled
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteValidation: async (projectId: string, validationId: string) => {
        return API.deleteRequest(`projects/${projectId}/validations/${validationId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteValidationViolation: async (projectId: string, validationViolationId: string) => {
        return API.deleteRequest(`projects/${projectId}/validation-violations/${validationViolationId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ValidationsAPI };
