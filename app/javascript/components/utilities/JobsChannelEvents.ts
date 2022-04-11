// Channel events
export const JOBS_CHANNEL_EVENT_JOB_STARTED = "JOB_STARTED";
export const JOBS_CHANNEL_EVENT_JOB_PROGRESS = "JOB_PROGRESS";
export const JOBS_CHANNEL_EVENT_JOB_COMPLETED = "JOB_COMPLETED";

// Channel types
export const JOBS_CHANNEL_TYPE_RECHECK_ALL_VALIDATIONS = "RECHECK_ALL_VALIDATIONS";

export interface IJobsChannelEvent {
    event:
        | typeof JOBS_CHANNEL_EVENT_JOB_STARTED
        | typeof JOBS_CHANNEL_EVENT_JOB_PROGRESS
        | typeof JOBS_CHANNEL_EVENT_JOB_COMPLETED;
    type: typeof JOBS_CHANNEL_TYPE_RECHECK_ALL_VALIDATIONS;
    project_id: string;
}
