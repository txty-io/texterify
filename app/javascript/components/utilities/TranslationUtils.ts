import { APIUtils } from "../api/v1/APIUtils";
import { IGetKeyResponse } from "../api/v1/KeysAPI";
import { ILanguage } from "../api/v1/LanguagesAPI";
import { ITranslation } from "../api/v1/TranslationsAPI";

const TranslationUtils = {
    // Checks if the given language supports machine translation as source.
    getTranslationForLanguage(data: { languageId: string; keyResponse: IGetKeyResponse; flavorId?: string }) {
        if (!data.languageId) {
            return null;
        }

        let translationForLanguage;

        if (data.keyResponse) {
            data.keyResponse.data.relationships.translations.data.some((translationReference) => {
                const translation = APIUtils.getIncludedObject(translationReference, data.keyResponse.included);

                // Check for language
                if (translation.relationships.language.data.id === data.languageId) {
                    if (data.flavorId) {
                        // If translation for flavor is requested
                        if (translation.relationships.flavor.data?.id === data.flavorId) {
                            translationForLanguage = translation;
                            return true;
                        }
                    } else if (!translation.relationships.flavor.data?.id) {
                        // If the default translation for that language is requested
                        translationForLanguage = translation;
                        return true;
                    }
                }
            });
        }

        return translationForLanguage;
    },

    hasContent(translation: ITranslation, language: ILanguage, pluralizationEnabled: boolean) {
        if (translation.attributes.content) {
            return true;
        }

        if (pluralizationEnabled) {
            if (language.attributes.supports_plural_zero && translation.attributes.zero) {
                return true;
            }

            if (language.attributes.supports_plural_one && translation.attributes.one) {
                return true;
            }

            if (language.attributes.supports_plural_two && translation.attributes.two) {
                return true;
            }

            if (language.attributes.supports_plural_few && translation.attributes.few) {
                return true;
            }

            if (language.attributes.supports_plural_many && translation.attributes.many) {
                return true;
            }
        }

        return false;
    }
};

export { TranslationUtils };
