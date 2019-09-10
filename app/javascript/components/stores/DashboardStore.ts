import * as localforage from "localforage";
import { observable } from "mobx";
import { create, persist } from "mobx-persist";

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
