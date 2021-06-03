import { IProject } from "../../stores/DashboardStore";
import { API } from "./API";
import { APIUtils } from "./APIUtils";

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
    };
    relationships: {
        project: { data: { id: string; type: "project" } | null };
        translation: { data: { id: string; type: "translation" } | null };
        validation: { data: { id: string; type: "validation" } | null };
    };
}

export interface IGetValidationViolationsResponse {
    data: IValidationViolation[];
    included: any[];
    meta: { total: number };
}

export interface IGetValidationViolationsCountResponse {
    total: number;
}

export interface IGetValidationViolationsOptions {
    page?: number;
    perPage?: number;
}

const ValidationViolationsAPI = {
    getAll: async (data: {
        projectId: string;
        options?: IGetValidationViolationsOptions;
    }): Promise<IGetValidationViolationsResponse> => {
        return API.getRequest(`projects/${data.projectId}/validation_violations`, true, {
            page: data.options && data.options.page,
            per_page: data.options && data.options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getCount: async (options: { projectId: string }): Promise<IGetValidationViolationsCountResponse> => {
        return API.getRequest(`projects/${options.projectId}/validation_violations_count`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ValidationViolationsAPI };
