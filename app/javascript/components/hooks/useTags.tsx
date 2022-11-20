import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { TagsAPI, IGetTagsOptions, IGetTagsResponse } from "../api/v1/TagsAPI";

export default function useTags(options: IGetTagsOptions) {
    const [tagsResponse, setTagsResponse] = React.useState<IGetTagsResponse>(null);
    const [tagsError, setTagsError] = React.useState(null);
    const [tagsLoading, setTagsLoading] = React.useState(false);

    async function load() {
        setTagsLoading(true);

        try {
            const data = await TagsAPI.getTags(options);
            setTagsResponse(data);
        } catch (e) {
            setTagsError(e);
            console.error(e);
            message.error("Failed to load tags.");
        } finally {
            setTagsLoading(false);
        }
    }

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [options]);

    return { tagsResponse, tagsError, tagsLoading, tagsForceReload: load };
}
