import * as queryString from "query-string";
import { authStore } from "../../stores/AuthStore";
import { APIUtils } from "../v1/APIUtils";
import { IAuthData } from "./AuthAPI";
import axios from "axios";

export interface IFetchOptions {
    signal?: AbortSignal;
}

const API_BASE_URL = "api";
const API_VERSION = "v1";

const DEFAULT_HEADERS: HeadersInit = {
    Accept: "application/json"
};

async function request(options: {
    url: string;
    authenticated: boolean | IAuthData;
    method: string;
    headers: HeadersInit;
    params?: any;
    isFileDownload?: boolean;
    isFormData?: boolean;
    fetchOptions?: IFetchOptions;
}): Promise<any> {
    const requestHeaders: any = {
        ...DEFAULT_HEADERS,
        ...options.headers
    };

    if (!options.isFormData) {
        requestHeaders["Content-Type"] = "application/json";
    }

    // In case it is an authenticated request add the necessary headers.
    if (options.authenticated) {
        if (typeof options.authenticated === "boolean") {
            requestHeaders.client = authStore.client;
            requestHeaders["access-token"] = authStore.accessToken;
            requestHeaders.uid = authStore.currentUser && authStore.currentUser.email;
        } else {
            requestHeaders.client = options.authenticated.client;
            requestHeaders["access-token"] = options.authenticated.accessToken;
            requestHeaders.uid = options.authenticated.uid;
        }
    }

    let fullURL = `/${API_BASE_URL}/${API_VERSION}/${options.url}`;

    // Add query params if it is a get request.
    if (options.method === "GET" && options.params) {
        fullURL += `?${queryString.stringify(options.params, { arrayFormat: "bracket" })}`;
    }

    let response: Response;
    try {
        response = await fetch(fullURL, {
            method: options.method,
            headers: requestHeaders,
            body:
                options.method === "GET" ? null : options.isFormData ? options.params : JSON.stringify(options.params),
            signal: options.fetchOptions?.signal
        });

        if (response.status === 403) {
            const json = await response.json();

            APIUtils.handleErrors(json);

            return {
                error: true,
                message: "FORBIDDEN",
                error_type: json?.error_type
            };
        } else {
            APIUtils.saveTokenFromResponseIfAvailable(response);
        }
    } catch (error) {
        console.error("Error while fetching:", error);
        throw error;
    }

    return response && !options.isFileDownload ? response.json() : response;
}

export const axiosInstance = axios.create({
    baseURL: `/${API_BASE_URL}/${API_VERSION}/`,
    headers: DEFAULT_HEADERS
});

axiosInstance.interceptors.request.use((config) => {
    if (config.headers) {
        config.headers["client"] = authStore.client;
        config.headers["access-token"] = authStore.accessToken;
        config.headers["uid"] = authStore.currentUser && authStore.currentUser.email;
    }

    return config;
});

const API = {
    getRequest: (
        url: string,
        authenticated: boolean,
        queryParams?: any,
        headers?: HeadersInit,
        isFileDownload?: boolean,
        fetchOptions?: IFetchOptions
    ): Promise<any> => {
        return request({
            url: url,
            authenticated: authenticated,
            method: "GET",
            headers: headers,
            params: queryParams,
            isFileDownload: isFileDownload,
            fetchOptions: fetchOptions
        });
    },

    postRequest: (
        url: string,
        authenticated: boolean,
        body?: any,
        headers?: HeadersInit,
        isFormData?: boolean
    ): any => {
        return request({
            url: url,
            authenticated: authenticated,
            method: "POST",
            headers: headers,
            isFormData: isFormData,
            params: body
        });
    },

    putRequest: (url: string, authenticated: boolean | IAuthData, body?: any, headers?: HeadersInit): any => {
        return request({
            url: url,
            authenticated: authenticated,
            method: "PUT",
            headers: headers,
            params: body
        });
    },

    deleteRequest: (url: string, authenticated: boolean, body?: any, headers?: HeadersInit): any => {
        return request({
            url: url,
            authenticated: authenticated,
            method: "DELETE",
            headers: headers,
            params: body
        });
    }
};

export { API };
