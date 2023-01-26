import * as localforage from "localforage";
import { observable } from "mobx";
import { create, persist } from "mobx-persist";
import { APIUtils } from "../api/v1/APIUtils";
import { BackgroundJobsAPI, IGetBackgroundJobsResponse } from "../api/v1/BackgroundJobsAPI";
import { IProject, ProjectsAPI } from "../api/v1/ProjectsAPI";
import { ValidationViolationsAPI } from "../api/v1/ValidationViolationsAPI";
import { IFeature } from "../types/IFeature";
import { IPlanIDS } from "../types/IPlan";
import { IUserRole } from "../types/IUserRole";
import { DEFAULT_PAGE_SIZE } from "../ui/Config";

export interface IOrganization {
    id: string;
    attributes: IOrganizationAttributes;
    relationships: any;
    type: string;
}

interface IOrganizationAttributes {
    id: string;
    name: string;
    current_user_role?: IUserRole;
    trial_ends_at: string;
    trial_active: boolean;
    enabled_features: IFeature[];
    machine_translation_character_usage: string;
    machine_translation_character_limit: string;
    deepl_api_token: string;
    deepl_api_token_type: "free" | "pro" | null;
    uses_custom_deepl_account: boolean;
    current_user_deactivated?: boolean;
    current_user_deactivated_reason?: "manually_by_admin" | "user_limit_exceeded";
    max_users_reached: boolean;
}

class DashboardStore {
    @observable currentProject: IProject = null;
    @observable currentProjectIncluded: any = null;
    @observable currentOrganization?: IOrganization = null;
    @observable @persist sidebarMinimized: boolean;
    @observable @persist keysPerPage = DEFAULT_PAGE_SIZE;
    @observable @persist keysPerPageEditor = DEFAULT_PAGE_SIZE;
    @observable hydrationFinished = false;
    @observable activeBackgroundJobsResponse: IGetBackgroundJobsResponse = null;
    @observable activeBackgroundJobsResponseProjectId: string = null;

    loadProject = async (projectId) => {
        const getProjectResponse = await ProjectsAPI.getProject(projectId);
        if (!getProjectResponse.errors) {
            this.currentProject = getProjectResponse.data;
            this.currentProjectIncluded = getProjectResponse.included;
        }
    };

    async loadBackgroundJobs(projectId: string) {
        this.activeBackgroundJobsResponseProjectId = projectId;

        try {
            const getBackgroundJobsResponse = await BackgroundJobsAPI.getBackgroundJobs(projectId, {
                status: ["CREATED", "RUNNING"]
            });
            this.activeBackgroundJobsResponse = getBackgroundJobsResponse;
        } catch (e) {
            console.error(e);
        }
    }

    getOrganizationId = (organizationId?: string) => {
        return (this.getProjectOrganization() && this.getProjectOrganization().id) || organizationId;
    };

    getOrganizationName = () => {
        if (this.getProjectOrganization()) {
            return this.getProjectOrganization().attributes.name;
        } else {
            return this.currentOrganization ? this.currentOrganization.attributes.name : "Organization";
        }
    };

    getProjectOrganization = () => {
        return (
            this.currentProject &&
            APIUtils.getIncludedObject(this.currentProject.relationships.organization.data, this.currentProjectIncluded)
        );
    };

    getCurrentRole = (): IUserRole => {
        return this.currentProject?.attributes.current_user_role;
    };

    getCurrentOrganizationRole = (): IUserRole => {
        if (this.currentOrganization) {
            return this.currentOrganization.attributes.current_user_role;
        } else {
            if (this.currentProject?.attributes.organization_id) {
                return this.getProjectOrganization()?.attributes.current_user_role;
            }
        }
    };

    featureEnabled(feature: IFeature, type?: "project" | "organization") {
        if (type === "organization") {
            return this.currentOrganization?.attributes.enabled_features.includes(feature);
        } else {
            return this.currentProject?.attributes.enabled_features.includes(feature);
        }
    }

    // Reloads the issues count of the currently selected project.
    async reloadCurrentProjectIssuesCount() {
        if (this.featureEnabled("FEATURE_VALIDATIONS") && this.currentProject) {
            const validationViolationsCountResponse = await ValidationViolationsAPI.getCount({
                projectId: this.currentProject.id
            });

            if (this.currentProject) {
                this.currentProject.attributes.issues_count = validationViolationsCountResponse.total;
            }
        }
    }
}

const hydrate: any = create({
    storage: localforage
});

const dashboardStore: DashboardStore = new DashboardStore();

hydrate("dashboardStore", dashboardStore)
    .then(() => {
        console.log("Hydrated from store successfully.");
        dashboardStore.hydrationFinished = true;
    })
    .catch((error: any) => {
        console.error("Error while hydrating:", error);
        dashboardStore.hydrationFinished = true;
    });

export { dashboardStore };
