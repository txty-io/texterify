import { APIUtils } from "../api/v1/APIUtils";
import { IGetLanguagesResponse, ILanguage } from "../api/v1/LanguagesAPI";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages
} from "../api/v1/MachineTranslationsAPI";

const MachineTranslationUtils = {
    // Checks if the given language supports machine translation as source.
    supportsMachineTranslationAsSourceLanguage(data: {
        language: ILanguage;
        languagesResponse: IGetLanguagesResponse;
        supportedSourceLanguages: IGetMachineTranslationsSourceLanguages;
    }) {
        if (!data.language) {
            return false;
        }

        const defaultLanguageLanguageCode = APIUtils.getIncludedObject(
            data.language.relationships.language_code.data,
            data.languagesResponse.included
        );

        // If the default language has no language code set it can't support machine translation.
        if (!defaultLanguageLanguageCode) {
            return false;
        }

        return data.supportedSourceLanguages?.data?.some((supportedSourceLanguage) => {
            return supportedSourceLanguage.attributes.language_code === defaultLanguageLanguageCode.attributes.code;
        });
    },

    supportsMachineTranslationAsTargetLanguage(data: {
        languageId: string;
        languagesResponse: IGetLanguagesResponse;
        supportedTargetLanguages: IGetMachineTranslationsTargetLanguages;
    }) {
        const language = data.languagesResponse.data.find((l) => {
            return l.id === data.languageId;
        });

        const languageLanguageCode = APIUtils.getIncludedObject(
            language.relationships.language_code.data,
            data.languagesResponse.included
        );

        // If the language has no language code set it can't support machine translation.
        if (!languageLanguageCode) {
            return false;
        }

        return data.supportedTargetLanguages?.data?.some((supportedTargetLanguage) => {
            return supportedTargetLanguage.attributes.language_code === languageLanguageCode.attributes.code;
        });
    }
};

export { MachineTranslationUtils };
