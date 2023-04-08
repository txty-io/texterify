import * as localforage from "localforage";
import * as _ from "lodash";
import { computed, observable } from "mobx";
import { create, persist } from "mobx-persist";
import { ICustomSubscription } from "../api/v1/OrganizationsAPI";
import { UsersAPI } from "../api/v1/UsersAPI";
import { IUserProfile } from "../api/v1/AuthAPI";

class AuthStore {
    @persist("object") @observable currentUser: IUserProfile | null = null;
    @persist @observable accessToken: string | null = null;
    @persist @observable client: string | null = null;
    @persist @observable userImageUrl: string | null = null;
    @observable confirmed: boolean | null = null;
    @observable version: string | null = null;
    @observable redeemableCustomSubscriptions: ICustomSubscription[] = [];
    @observable hydrationFinished = false;

    @computed get isAuthenticated(): boolean {
        return !_.isEmpty(this.accessToken) && !_.isEmpty(this.client) && !_.isEmpty(this.currentUser);
    }

    refetchCurrentUserImage = async () => {
        if (this.currentUser) {
            const imageResponse = await UsersAPI.getImage(this.currentUser.id);
            this.userImageUrl = imageResponse.image;
        }
    };

    resetAuth = () => {
        this.accessToken = null;
        this.client = null;
        this.currentUser = null;
        this.userImageUrl = null;
        this.confirmed = null;
    };
}

// Persist this mobx state through localforage.
const hydrate: any = create({
    storage: localforage
});

const authStore: AuthStore = new AuthStore();

hydrate("currentUser", authStore)
    .then(() => {
        console.log("[AuthStore] Hydrated from store successfully.");
        authStore.hydrationFinished = true;
    })
    .catch((error: any) => {
        console.error("[AuthStore] Error while hydrating:", error);
        authStore.hydrationFinished = true;
    });

export { authStore };
