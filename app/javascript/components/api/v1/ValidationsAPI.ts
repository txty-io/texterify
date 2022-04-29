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
        project_id: string;
        organization_id: string;
        language_code_id: string;
        country_code_id: string;
        enabled: boolean;
    };
}

export interface IGetValidationsResponse {
    data: IValidation[];
    meta: { total: number };
}

export interface IGetValidationsOptions {
    linkedId: string;
    linkedType: IValidationLinkedTo;
    page?: number;
    perPage?: number;
}

export type IValidationLinkedTo = "project" | "organization";

const ValidationsAPI = {
    getValidations: async (options: IGetValidationsOptions): Promise<IGetValidationsResponse> => {
        return API.getRequest(`${options.linkedType}s/${options.linkedId}/validations`, true, {
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createValidation: async (options: {
        linkedId: string;
        linkedType: IValidationLinkedTo;
        name: string;
        description: string;
        match: string;
        content: string;
    }) => {
        return API.postRequest(`${options.linkedType}s/${options.linkedId}/validations`, true, {
            name: options.name,
            description: options.description,
            match: options.match,
            content: options.content
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateValidation: async (options: {
        linkedId: string;
        linkedType: IValidationLinkedTo;
        validationId: string;
        name?: string;
        description?: string;
        match?: string;
        content?: string;
        enabled?: boolean;
    }) => {
        return API.putRequest(`${options.linkedType}s/${options.linkedId}/validations/${options.validationId}`, true, {
            name: options.name,
            description: options.description,
            match: options.match,
            content: options.content,
            enabled: options.enabled
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteValidation: async (options: { linkedId: string; linkedType: IValidationLinkedTo; validationId: string }) => {
        return API.deleteRequest(`${options.linkedType}s/${options.linkedId}/validations/${options.validationId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    checkValidations: async (options: { linkedId: string; linkedType: IValidationLinkedTo; validationId?: string }) => {
        return API.postRequest(`${options.linkedType}s/${options.linkedId}/validations_check`, true, {
            validation_id: options.validationId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getForbiddenWordsLists: (options: { linkedId: string; linkedType: IValidationLinkedTo }) => {
        return API.getRequest(`${options.linkedType}s/${options.linkedId}/forbidden_words_lists`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getForbiddenWordsList: (options: {
        linkedId: string;
        linkedType: IValidationLinkedTo;
        forbiddenWordListId: string;
    }) => {
        return API.getRequest(
            `${options.linkedType}s/${options.linkedId}/forbidden_words_lists/${options.forbiddenWordListId}`,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ValidationsAPI };
