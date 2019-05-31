import * as queryString from "query-string";
import { authStore } from "../../stores/AuthStore";
import { APIUtils } from "../v1/APIUtils";

const API_BASE_URL: string = "api";
const API_VERSION: string = "v1";

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/json"
};

async function request(
  options: {
    url: string;
    authenticated: boolean;
    method: string;
    headers: HeadersInit;
    params?: any;
    isFileDownload?: boolean;
    isFormData?: boolean;
  }
): Promise<any> {
  const requestHeaders: any = {
    ...DEFAULT_HEADERS,
    ...options.headers
  };

  if (!options.isFormData) {
    requestHeaders["Content-Type"] = "application/json";
  }

  // In case it is an authenticated request add the necessary headers.
  if (options.authenticated) {
    requestHeaders.client = authStore.client;
    requestHeaders["access-token"] = authStore.accessToken;
    requestHeaders.uid = authStore.currentUser && authStore.currentUser.email;
  }

  let fullURL: string = `/${API_BASE_URL}/${API_VERSION}/${options.url}`;

  // Add query params if it is a get request.
  if (options.method === "GET" && options.params) {
    fullURL += `?${queryString.stringify(options.params)}`;
  }

  let response: any;
  try {
    response = await fetch(fullURL, {
      method: options.method,
      headers: requestHeaders,
      body: options.method === "GET" ? null : options.isFormData ? options.params : JSON.stringify(options.params)
    });
  } catch (error) {
    console.error("Error while fetching:", error);
  }

  APIUtils.saveTokenFromResponseIfAvailable(response);

  return response && !options.isFileDownload ? response.json() : response;
}

const API = {
  getRequest: (url: string, authenticated: boolean, queryParams?: any, headers?: HeadersInit, isFileDownload?: boolean): any => {
    return request({
      url: url,
      authenticated: authenticated,
      method: "GET",
      headers: headers,
      params: queryParams,
      isFileDownload: isFileDownload
    });
  },

  postRequest: (url: string, authenticated: boolean, body?: any, headers?: HeadersInit, isFormData?: boolean): any => {
    return request({
      url: url,
      authenticated: authenticated,
      method: "POST",
      headers: headers,
      isFormData: isFormData,
      params: body
    });
  },

  putRequest: (url: string, authenticated: boolean, body?: any, headers?: HeadersInit): any => {
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