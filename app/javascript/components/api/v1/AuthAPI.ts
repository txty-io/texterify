import { authStore } from "../../stores/AuthStore";
import { API } from "./API";
import { APIUtils } from "./APIUtils";

export type IAuthData = {
  client: string;
  accessToken: string;
  uid: string;
};

const AuthAPI = {
  signup: async (username: string, email: string, password: string, passwordConfirmation: string): Promise<any> => {
    return API.postRequest("auth", false, {
      username: username,
      email: email,
      password: password,
      password_confirmation: passwordConfirmation
    });
  },

  login: async (email: string, password: string): Promise<any> => {
    return API.postRequest("auth/sign_in", false, null, {
      email: email,
      password: password
    });
  },

  logout: async (): Promise<any> => {
    const response: any = await API.deleteRequest("auth/sign_out", true, null, null);
    authStore.resetAuth();
  },

  changePassword: async (currentPassword: string, newPassword: string, newPasswordConfirmation: string): Promise<any> => {
    return API.putRequest("auth/password", true, {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPasswordConfirmation
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  setNewPassword: async (newPassword: string, newPasswordConfirmation: string, authData?: IAuthData): Promise<any> => {
    return API.putRequest("auth/password", authData || true, {
      password: newPassword,
      password_confirmation: newPasswordConfirmation
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  },

  sendPasswordRecoveryInstructions: async (email: string): Promise<any> => {
    return API.postRequest("auth/password", true, {
      email: email
    }).then(APIUtils.handleErrors).catch(APIUtils.handleErrors);
  }
};

export { AuthAPI };
