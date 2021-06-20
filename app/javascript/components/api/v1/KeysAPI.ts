import { ISearchSettings } from "../../ui/KeySearchSettings";
import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IGetKeysOptions {
    search?: string;
    page?: number;
    perPage?: number;
    searchSettings?: ISearchSettings;
}

export interface IKey {
    id: string;
    type: "key";
    attributes: {
        id: string;
        project_id: string;
        name: string;
        description: string;
        html_enabled: boolean;
    };
    relationships: {
        translations: { data: any };
    };
}
export interface IGetKeysResponse {
    data: IKey[];
    included: any[];
    meta: { total: number };
}

const KeysAPI = {
    getKey: async (projectId: string, keyId: string): Promise<any> => {
        return API.getRequest(`projects/${projectId}/keys/${keyId}`, true, {})
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getKeys: async (projectId: string, options: IGetKeysOptions): Promise<IGetKeysResponse> => {
        return API.getRequest(`projects/${projectId}/keys`, true, {
            search: (options && options.search) || undefined,
            page: options && options.page,
            per_page: options && options.perPage,
            match: options && options.searchSettings && options.searchSettings.match,
            case_sensitive: options && options.searchSettings && options.searchSettings.checkCase,
            only_untranslated: options && options.searchSettings && options.searchSettings.showOnlyUntranslated,
            only_html_enabled: options && options.searchSettings && options.searchSettings.onlyHTMLEnabled,
            only_with_overwrites:
                options && options.searchSettings && options.searchSettings.showOnlyKeysWithOverwrites,
            changed_before: options && options.searchSettings && options.searchSettings.changedBefore,
            changed_after: options && options.searchSettings && options.searchSettings.changedAfter,
            language_ids: options && options.searchSettings && options.searchSettings.languageIds,
            export_config_ids: options && options.searchSettings && options.searchSettings.exportConfigIds
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createKey: async (projectId: string, name: string, description: string, htmlEnabled: boolean): Promise<any> => {
        return API.postRequest(`projects/${projectId}/keys`, true, {
            name: name,
            description: description,
            html_enabled: htmlEnabled
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    update: async (projectId: string, keyId: string, name: string, description: string, htmlEnabled: boolean) => {
        return API.putRequest(`projects/${projectId}/keys/${keyId}`, true, {
            name: name,
            description: description,
            html_enabled: htmlEnabled
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteKeys: async (projectId: string, keys: any) => {
        return API.deleteRequest(`projects/${projectId}/keys`, true, {
            keys: keys
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    getActivity: async (options: { projectId: string; keyId: string }) => {
        return API.getRequest(`projects/${options.projectId}/keys/${options.keyId}/activity`, true, {})
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { KeysAPI };
