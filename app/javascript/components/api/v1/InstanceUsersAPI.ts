import { API } from "./API";
import { APIUtils } from "./APIUtils";
import { IGetUsersResponse, IUser } from "./OrganizationMembersAPI";

export interface IGetInstanceUsersOptions {
    search?: string;
    page?: number;
    perPage?: number;
}

export interface IInstanceUser {
    id: string;
    type: "user";
    attributes: {
        id: string;
        username: string;
        email: string;
        is_superadmin: true;
        deactivated: boolean;
        deactivated_reason: string;
        confirmed: boolean;
        sign_in_count: number;
        created_at: string;
        last_sign_in_at: string;
    };
}

export interface IGetInstanceUsersResponse {
    data: IInstanceUser[];
    meta: {
        total: number;
    };
}

const InstanceUsersAPI = {
    getUsers: async (options?: IGetInstanceUsersOptions): Promise<IGetInstanceUsersResponse> => {
        return API.getRequest("instance/users", true, {
            search: options && options.search,
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { InstanceUsersAPI };
