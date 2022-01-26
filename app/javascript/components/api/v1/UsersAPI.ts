import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { ICustomSubscription } from "./OrganizationsAPI";

export interface IGetUserRedeemableCustomSubscriptions {
    data: ICustomSubscription[];
}

const UsersAPI = {
    getCurrentUserInfo: async (): Promise<{
        confirmed: boolean;
        version: string;
        redeemable_custom_subscriptions: IGetUserRedeemableCustomSubscriptions;
    }> => {
        return API.getRequest("users/info", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    },

    updateUser: async (options: { username: string; email: string }): Promise<any> => {
        return API.putRequest("auth", true, {
            username: options.username,
            email: options.email
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getImage: async (userId: string): Promise<any> => {
        return API.getRequest("users/image", true, {
            userId: userId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteImage: async (): Promise<any> => {
        return API.deleteRequest("users/image", true).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
    },

    uploadImage: async (formData): Promise<any> => {
        return API.postRequest("users/image", true, formData, null, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { UsersAPI };
