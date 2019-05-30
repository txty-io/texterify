import { observable } from "mobx";

interface IProject {
  id: string;
  attributes: IProjectAttributes;
}

interface IProjectAttributes {
  id: string;
  name: string;
  description: string;
}

class DashboardStore {
  @observable currentProject: IProject = null;
}

const dashboardStore: DashboardStore = new DashboardStore();

export { dashboardStore };
