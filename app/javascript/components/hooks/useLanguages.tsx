import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { APIUtils } from "../api/v1/APIUtils";
import { LanguagesAPI, IGetLanguagesOptions, IGetLanguagesResponse, ILanguage, ICountryCode } from "../api/v1/LanguagesAPI";

export default function useLanguages(projectId: string, options?: IGetLanguagesOptions) {
    const [languagesResponse, setLanguagesResponse] = React.useState<IGetLanguagesResponse>(null);
    const [languagesError, setLanguagesError] = React.useState(null);
    const [languagesLoading, setLanguagesLoading] = React.useState(false);

    async function load() {
        setLanguagesLoading(true);

        try {
            const data = await LanguagesAPI.getLanguages(projectId, options);
            setLanguagesResponse(data);
        } catch (e) {
            setLanguagesError(e);
            console.error(e);
            message.error("Failed to load languages.");
        } finally {
            setLanguagesLoading(false);
        }
    }

    function getLanguageForId(languageId: string) {
        return languagesResponse?.data.find((item) => {
            return item.id === languageId;
        });
    }

    function getCountryCodeForLanguage(language: ILanguage): ICountryCode {
        return APIUtils.getIncludedObject(language?.relationships.country_code.data, languagesResponse.included);
    }

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [projectId, options]);

    return {
        languagesResponse,
        languagesError,
        languagesLoading,
        languagesForceReload: load,
        getLanguageForId,
        getCountryCodeForLanguage
    };
}
