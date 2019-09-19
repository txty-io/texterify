import * as localforage from "localforage";
import { observable } from "mobx";
import { create, persist } from "mobx-persist";
import { APIUtils } from "../api/v1/APIUtils";
import { history } from "../routing/history";

interface IProject {
  id: string;
  attributes: IProjectAttributes;
  relationships: any;
  type: string;
}

interface IOrganization {
  id: string;
  attributes: IProjectAttributes;
  relationships: any;
  type: string;
}

interface IProjectAttributes {
  id: string;
  name: string;
  description: string;
}

class DashboardStore {
  @observable currentProject: IProject = null;
  @observable currentProjectIncluded: any = null;
  @observable currentOrganization: IOrganization = null;
  @observable @persist sidebarMinimized: boolean;
  @observable @persist keysPerPage: number = 10;
  @observable hydrationFinished: boolean = false;

  getOrganizationId = (organizationId?: string) => {
    return (this.getProjectOrganization() && this.getProjectOrganization().id) || organizationId;
  }

  getOrganizationName = () => {
    if (this.getProjectOrganization()) {
      return this.getProjectOrganization().attributes.name;
    } else {
      return dashboardStore.currentOrganization ? dashboardStore.currentOrganization.attributes.name : "Organization";
    }
  }

  getProjectOrganization = () => {
    return dashboardStore.currentProject &&
      APIUtils.getIncludedObject(dashboardStore.currentProject.relationships.organization.data, dashboardStore.currentProjectIncluded);
  }
}

const hydrate: any = create({
  storage: localforage
});

const dashboardStore: DashboardStore = new DashboardStore();

hydrate("dashboardStore", dashboardStore).then(() => {
  console.log("Hydrated from store successfully.");
  dashboardStore.hydrationFinished = true;
}).catch((error: any) => {
  console.error("Error while hydrating:", error);
  dashboardStore.hydrationFinished = true;
});

export { dashboardStore };
