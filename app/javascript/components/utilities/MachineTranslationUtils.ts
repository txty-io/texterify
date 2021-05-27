import { APIUtils } from "../api/v1/APIUtils";
import { IGetLanguagesResponse, ILanguage } from "../api/v1/LanguagesAPI";
import { IGetMachineTranslationsSourceLanguages } from "../api/v1/MachineTranslationsAPI";

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

        return data.supportedSourceLanguages?.data.some((supportedSourceLanguage) => {
            return supportedSourceLanguage.attributes.language_code === defaultLanguageLanguageCode.attributes.code;
        });
    }
};

export { MachineTranslationUtils };
