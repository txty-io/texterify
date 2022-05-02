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
        organization_id: string;
        language_code_id: string;
        country_code_id: string;
        words_count: number;
    };
    relationships: {
        country_code: { data: null | { id: string; type: "country_code" } };
        language_code: { data: null | { id: string; type: "language_code" } };
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
    included: any[];
}

export type IForbiddenWordsListLinkedTo = "project" | "organization";

export interface IGetForbiddenWordsListsOptions {
    linkedId: string;
    linkedType: IForbiddenWordsListLinkedTo;
    page?: number;
    perPage?: number;
}

const ForbiddenWordsListsAPI = {
    getForbiddenWordsLists: async (
        options: IGetForbiddenWordsListsOptions
    ): Promise<IGetForbiddenWordsListsResponse> => {
        return API.getRequest(`${options.linkedType}s/${options.linkedId}/forbidden_words_lists`, true, {
            page: options && options.page,
            per_page: options && options.perPage
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    createForbiddenWordsList: async (options: {
        linkedId: string;
        linkedType: IForbiddenWordsListLinkedTo;
        name: string;
        content?: string;
        languageCodeId?: string;
        countryCodeId?: string;
    }) => {
        return API.postRequest(`${options.linkedType}s/${options.linkedId}/forbidden_words_lists`, true, {
            name: options.name,
            content: options.content,
            language_code_id: options.languageCodeId,
            country_code_id: options.countryCodeId
        })
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    updateForbiddenWordsList: async (options: {
        linkedId: string;
        linkedType: IForbiddenWordsListLinkedTo;
        forbiddenWordsListId: string;
        name: string;
        content: string;
        languageCodeId: string;
        countryCodeId: string;
    }) => {
        return API.putRequest(
            `${options.linkedType}s/${options.linkedId}/forbidden_words_lists/${options.forbiddenWordsListId}`,
            true,
            {
                name: options.name,
                content: options.content,
                language_code_id: options.languageCodeId,
                country_code_id: options.countryCodeId
            }
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    },

    deleteForbiddenWordsList: async (options: {
        linkedId: string;
        linkedType: IForbiddenWordsListLinkedTo;
        forbiddenWordsListId: string;
    }) => {
        return API.deleteRequest(
            `${options.linkedType}s/${options.linkedId}/forbidden_words_lists/${options.forbiddenWordsListId}`,
            true
        )
            .then(APIUtils.handleErrors)
            .catch(APIUtils.handleErrors);
    }
};

export { ForbiddenWordsListsAPI };
