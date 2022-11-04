import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { LanguagesAPI, IGetLanguagesOptions, IGetLanguagesResponse } from "../api/v1/LanguagesAPI";

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

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [projectId, options]);

    return { languagesResponse, languagesError, languagesLoading, languagesForceReload: load };
}
