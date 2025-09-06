import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface ITagAttributes {
    id: string;
    name: string;
    custom: boolean;
    disable_translation_for_translators: boolean;
}

export interface ITag {
    id: string;
    attributes: ITagAttributes;
    relationships: {
        keys: { data: null | { id: string; type: "key" } };
    };
    type: "tag";
}

export interface IGetTagsOptions {
    projectId: string;
    search: string | null;
}

export interface IGetTagsResponse {
    data: ITag[];
    meta: {
        total: number;
    };
}

const TagsAPI = {
    getTags: async (options: IGetTagsOptions): Promise<IGetTagsResponse> => {
        return API.getRequest(`projects/${options.projectId}/tags`, true, {
            search: options.search
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createTag: async (options: { projectId: string; name: string; disable_translation_for_translators: boolean }) => {
        return API.postRequest(`projects/${options.projectId}/tags`, true, {
            name: options.name,
            disable_translation_for_translators: options.disable_translation_for_translators
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateTag: async (options: {
        projectId: string;
        tagId: string;
        name: string;
        disable_translation_for_translators: boolean;
    }) => {
        return API.putRequest(`projects/${options.projectId}/tags/${options.tagId}`, true, {
            name: options.name,
            disable_translation_for_translators: options.disable_translation_for_translators
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteTag: async (options: { projectId: string; tagId: string }) => {
        return API.deleteRequest(`projects/${options.projectId}/tags/${options.tagId}`, true)
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { TagsAPI };
