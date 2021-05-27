import { IGetLanguagesResponse } from "../api/v1/LanguagesAPI";

const LanguageUtils = {
    // Returns the default language if available.
    getDefaultLanguage: (languagesResponse: IGetLanguagesResponse) => {
        return languagesResponse?.data.find((language) => {
            return language.attributes.is_default;
        });
    }
};

export { LanguageUtils };
