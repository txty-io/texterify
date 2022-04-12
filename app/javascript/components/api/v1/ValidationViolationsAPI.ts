import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { IKey } from "./KeysAPI";
import { ITranslation } from "./TranslationsAPI";
import { IValidation } from "./ValidationsAPI";

export interface IValidationViolation {
    id: string;
    type: "validation_violation";
    attributes: {
        id: string;
        name:
            | "validate_leading_whitespace"
            | "validate_trailing_whitespace"
            | "validate_double_whitespace"
            | "validate_https";
        ignored: boolean;
        project_id: string;
        validation_id: string;
        translation_id: string;
        forbidden_word_id: string;
        placeholder_id: string;
    };
    relationships: {
        project: { data: { id: string; type: "project" } | null };
        translation: { data: { id: string; type: "translation" } | null };
        validation: { data: { id: string; type: "validation" } | null };
        forbidden_word: { data: { id: string; type: "forbidden_word" } | null };
        placeholder: { data: { id: string; type: "placeholder" } | null };
    };
}

export interface IGetValidationViolationsResponse {
    data: IValidationViolation[];
    included: (IValidation | ITranslation | IKey)[];
    meta: { total: number };
}

export interface IGetValidationViolationsCountResponse {
    total: number;
}

export interface IGetValidationViolationsOptions {
    page?: number;
    perPage?: number;
    onlyIgnored?: boolean;
    onlyUnignored?: boolean;
}

export interface IIgnoreValidationViolationsResponse {
    success: boolean;
    details: "VALIDATION_VIOLATION_UPDATED";
}

export interface IIgnoreMultipleValidationViolationsResponse {
    success: boolean;
    details: "VALIDATION_VIOLATIONS_UPDATED";
}

export interface IDeleteValidationViolationsResponse {
    success: boolean;
    details: "VALIDATION_VIOLATION_DELETED";
}

export interface IDeleteMultipleValidationViolationsResponse {
    success: boolean;
    details: "VALIDATION_VIOLATIONS_DELETED";
}

const ValidationViolationsAPI = {
    getAll: async (data: {
        projectId: string;
        options?: IGetValidationViolationsOptions;
    }): Promise<IGetValidationViolationsResponse> => {
        return API.getRequest(`projects/${data.projectId}/validation_violations`, true, {
            page: data.options && data.options.page,
            per_page: data.options && data.options.perPage,
            only_ignored: data.options && data.options.onlyIgnored,
            only_unignored: data.options && data.options.onlyUnignored
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getCount: async (options: { projectId: string }): Promise<IGetValidationViolationsCountResponse> => {
        return API.getRequest(`projects/${options.projectId}/validation_violations_count`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    delete: async (options: {
        projectId: string;
        validationViolationId: string;
    }): Promise<IDeleteValidationViolationsResponse> => {
        return API.deleteRequest(
            `projects/${options.projectId}/validation_violations/${options.validationViolationId}`,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteMultiple: async (options: {
        projectId: string;
        validationViolationIds: string[];
    }): Promise<IDeleteMultipleValidationViolationsResponse> => {
        return API.deleteRequest(`projects/${options.projectId}/validation_violations`, true, {
            validation_violation_ids: options.validationViolationIds
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    update: async (options: {
        projectId: string;
        validationViolationId: string;
        ignored: boolean;
    }): Promise<IIgnoreValidationViolationsResponse> => {
        return API.putRequest(
            `projects/${options.projectId}/validation_violations/${options.validationViolationId}`,
            true,
            {
                ignored: options.ignored
            }
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateMultiple: async (options: {
        projectId: string;
        validationViolationIds: string[];
        ignored: boolean;
    }): Promise<IIgnoreMultipleValidationViolationsResponse> => {
        return API.putRequest(`projects/${options.projectId}/validation_violations`, true, {
            validation_violation_ids: options.validationViolationIds,
            ignored: options.ignored
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ValidationViolationsAPI };
