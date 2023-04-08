import { Progress } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { IBackgroundJob } from "../api/v1/BackgroundJobsAPI";
import { dashboardStore } from "../stores/DashboardStore";
import { Styles } from "./Styles";

function getProgressStatus(status: IBackgroundJob["attributes"]["status"]) {
    if (status === "RUNNING") {
        return "active";
    } else if (status === "COMPLETED") {
        return "success";
    } else if (status === "FAILED") {
        return "exception";
    } else {
        return "normal";
    }
}

function getJobTypeText(jobType: IBackgroundJob["attributes"]["job_type"]) {
    if (jobType === "RECHECK_ALL_VALIDATIONS") {
        return "Checking for validation issues";
    } else if (jobType === "CHECK_PLACEHOLDERS") {
        return "Checking for placeholder issues";
    } else if (jobType === "IMPORT_VERIFY") {
        return "Verifying import";
    } else if (jobType === "IMPORT_IMPORT") {
        return "Importing translations";
    } else {
        return jobType;
    }
}

export const BackgroundJobsPopupContent = observer(() => {
    if (!dashboardStore.activeBackgroundJobsResponse) {
        return <div style={{ padding: "4px 16px", color: Styles.COLOR_TEXT_DISABLED }}>Loading background jobs...</div>;
    }

    if (dashboardStore.activeBackgroundJobsResponse.data.length === 0) {
        return (
            <div style={{ padding: "4px 16px", color: Styles.COLOR_TEXT_DISABLED }}>No running background jobs.</div>
        );
    }

    return dashboardStore.activeBackgroundJobsResponse.data.map((job) => {
        return (
            <div style={{ padding: "4px 16px" }} key={job.id}>
                {getJobTypeText(job.attributes.job_type)}
                <Progress percent={job.attributes.progress} status={getProgressStatus(job.attributes.status)} />
            </div>
        );
    });
});
