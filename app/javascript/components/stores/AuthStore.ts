import * as localforage from "localforage";
import * as _ from "lodash";
import { computed, observable } from "mobx";
import { create, persist } from "mobx-persist";
import { UsersAPI } from "../api/v1/UsersAPI";

type IUserProfile = {
  allow_password_change: boolean;
  email: string;
  id: string;
  provider: string;
  uid: string;
  username: string;
};

class AuthStore {
  @persist("object") @observable currentUser: IUserProfile = null;
  @persist @observable accessToken: string | null = null;
  @persist @observable client: string | null = null;
  @persist @observable userImageUrl: string | null = null;
  @observable hydrationFinished: boolean = false;

  @computed get isAuthenticated(): boolean {
    return !_.isEmpty(this.accessToken)
      && !_.isEmpty(this.client)
      && !_.isEmpty(this.currentUser);
  }

  refetchCurrentUserImage = async () => {
    if (authStore.currentUser) {
      const imageResponse = await UsersAPI.getImage(authStore.currentUser.id);
      this.userImageUrl = imageResponse.image;
    }
  }

  resetAuth = () => {
    this.accessToken = null;
    this.client = null;
    this.currentUser = null;
    this.userImageUrl = null;
  }
}

// Persist this mobx state through localforage.
const hydrate: any = create({
  storage: localforage
});

const authStore: AuthStore = new AuthStore();

hydrate("currentUser", authStore).then(() => {
  console.log("Hydrated from store successfully.");
  authStore.hydrationFinished = true;
}).catch((error: any) => {
  console.error("Error while hydrating:", error);
  authStore.hydrationFinished = true;
});

export { authStore };
