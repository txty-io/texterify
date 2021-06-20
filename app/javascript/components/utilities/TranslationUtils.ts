import { APIUtils } from "../api/v1/APIUtils";

const TranslationUtils = {
    // Checks if the given language supports machine translation as source.
    getTranslationForLanguage(data: { languageId: string; keyResponse: any; exportConfigId?: string }) {
        if (!data.languageId) {
            return null;
        }

        let translationForLanguage;

        if (data.keyResponse) {
            data.keyResponse.data.relationships.translations.data.some((translationReference) => {
                const translation = APIUtils.getIncludedObject(translationReference, data.keyResponse.included);

                // Check for language
                if (translation.relationships.language.data.id === data.languageId) {
                    if (data.exportConfigId) {
                        // If translation for export config is requested
                        if (translation.relationships.export_config.data?.id === data.exportConfigId) {
                            translationForLanguage = translation;
                            return true;
                        }
                    } else if (!translation.relationships.export_config.data?.id) {
                        // If the default translation for that language is requested
                        translationForLanguage = translation;
                        return true;
                    }
                }
            });
        }

        return translationForLanguage;
    }
};

export { TranslationUtils };
