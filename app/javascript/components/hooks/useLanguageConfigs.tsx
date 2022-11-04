import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import {
    IGetLanguageConfigsOptions,
    IGetLanguageConfigsResponse,
    LanguageConfigsAPI
} from "../api/v1/LanguageConfigsAPI";

export default function useLanguageConfigs(props: { options: IGetLanguageConfigsOptions }) {
    const [languageConfigsResponse, setLanguageConfigsResponse] = React.useState<IGetLanguageConfigsResponse>(null);
    const [languageConfigsError, setLanguageConfigsError] = React.useState(null);
    const [languageConfigsLoading, setLanguageConfigsLoading] = React.useState(false);

    async function load() {
        if (props.options.projectId && props.options.exportConfigId) {
            setLanguageConfigsLoading(true);

            try {
                const data = await LanguageConfigsAPI.getLanguageConfigs({
                    projectId: props.options.projectId,
                    exportConfigId: props.options.exportConfigId
                });
                setLanguageConfigsResponse(data);
            } catch (e) {
                setLanguageConfigsError(e);
                console.error(e);
                message.error("Failed to load language configs.");
            } finally {
                setLanguageConfigsLoading(false);
            }
        }
    }

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [props.options]);

    return { languageConfigsResponse, languageConfigsError, languageConfigsLoading, languageConfigsForceReload: load };
}
