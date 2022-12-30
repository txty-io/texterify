import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { IGetImportReviewOptions, IImportReviewResponse, ImportsAPI } from "../api/v1/ImportsAPI";

export default function useImportReview(options: IGetImportReviewOptions) {
    const [importReviewResponse, setImportReviewResponse] = React.useState<IImportReviewResponse | null>(null);
    const [importReviewError, setImportReviewError] = React.useState<string | null>(null);
    const [importReviewLoading, setImportReviewLoading] = React.useState(false);

    async function load() {
        setImportReviewLoading(true);

        try {
            const data = await ImportsAPI.review(options);
            if (data) {
                setImportReviewResponse(data);
            } else {
                message.error("Failed to load import review data.");
                setImportReviewError("Failed to load import review data.");
            }
        } catch (e) {
            console.error(e);
            message.error("Failed to load import review data.");
            setImportReviewError(e);
        } finally {
            setImportReviewLoading(false);
        }
    }

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [options]);

    return { importReviewResponse, importReviewError, importReviewLoading, importReviewForceReload: load };
}
