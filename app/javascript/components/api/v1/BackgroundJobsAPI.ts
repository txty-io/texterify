import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IBackgroundJob {
    id: string;
    type: "background_job";
    attributes: {
        id: string;
        status: "COMPLETED" | "RUNNING" | "FAILED";
        progress: number;
        job_type: "RECHECK_ALL_VALIDATIONS";
    };
}

export interface IGetBackgroundJobsResponse {
    data: IBackgroundJob[];
    meta: { total: number };
}

export interface IGetBackgroundJobsOptions {
    status?: ("CREATED" | "RUNNING" | "COMPLETED")[];
    jobTypes?: "RECHECK_ALL_VALIDATIONS"[];
    page?: number;
    perPage?: number;
}

const BackgroundJobsAPI = {
    getBackgroundJobs: async (
        projectId: string,
        options?: IGetBackgroundJobsOptions
    ): Promise<IGetBackgroundJobsResponse> => {
        return API.getRequest(`projects/${projectId}/background_jobs`, true, {
            status: options && options.status,
            job_types: options && options.jobTypes,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { BackgroundJobsAPI };
