import { API } from "./API";
import { APIUtils } from "./APIUtils";

export interface IForbiddenWordsList {
    id: string;
    type: "forbidden_words_list";
    attributes: {
        id: string;
        name: string;
        content: string;
        project_id: string;
        language_id: string;
        words_count: number;
    };
}

export interface IForbiddenWord {
    id: string;
    type: "forbidden_word";
    attributes: {
        id: string;
        content: string;
    };
}

export interface IGetForbiddenWordsListsResponse {
    data: IForbiddenWordsList[];
    meta: { total: number };
}

export interface IGetForbiddenWordsListsOptions {
    projectId: string;
    page?: number;
    perPage?: number;
}

const ForbiddenWordsListsAPI = {
    getForbiddenWordsLists: async (
        options: IGetForbiddenWordsListsOptions
    ): Promise<IGetForbiddenWordsListsResponse> => {
        return API.getRequest(`projects/${options.projectId}/forbidden_words_lists`, true, {
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createForbiddenWordsList: async (options: {
        projectId: string;
        name: string;
        content?: string;
        languageId?: string;
    }) => {
        return API.postRequest(`projects/${options.projectId}/forbidden_words_lists`, true, {
            name: options.name,
            content: options.content,
            language_id: options.languageId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateForbiddenWordsList: async (options: {
        projectId: string;
        forbiddenWordsListId: string;
        name: string;
        content: string;
        languageId: string;
    }) => {
        return API.putRequest(
            `projects/${options.projectId}/forbidden_words_lists/${options.forbiddenWordsListId}`,
            true,
            {
                name: options.name,
                content: options.content,
                language_id: options.languageId
            }
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteForbiddenWordsList: async (options: { projectId: string; forbiddenWordsListId: string }) => {
        return API.deleteRequest(
            `projects/${options.projectId}/forbidden_words_lists/${options.forbiddenWordsListId}`,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ForbiddenWordsListsAPI };
