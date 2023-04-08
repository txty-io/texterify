import { useMutation } from "react-query";
import { axiosInstance } from "../api/v1/API";
import { IUserProfile } from "../api/v1/AuthAPI";

export interface ILoginResponse {
    data: IUserProfile;
}

export interface ILoginErrorResponse {
    error: true;
    error_type: "USER_IS_DEACTIVATED";
    errors: string[];
}

export const useLogin = () =>
    useMutation(async (data: { email: string; password: string }) => {
        const response = await axiosInstance.post<ILoginResponse>("auth/sign_in", {
            email: data.email,
            password: data.password
        });

        return response;
    });
