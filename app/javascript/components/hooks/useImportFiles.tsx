import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { IGetImportFilesResponse, IGetImportImportFilesOptions, ImportsAPI } from "../api/v1/ImportsAPI";

export default function useImportFiles(options: IGetImportImportFilesOptions) {
    const [importFilesResponse, setImportFilesResponse] = React.useState<IGetImportFilesResponse | null>(null);
    const [importFilesError, setImportFilesError] = React.useState<string | null>(null);
    const [importFilesLoading, setImportFilesLoading] = React.useState(false);

    async function load() {
        setImportFilesLoading(true);

        try {
            const data = await ImportsAPI.getImportFiles(options);
            if (data) {
                setImportFilesResponse(data);
            } else {
                message.error("Failed to load import files.");
                setImportFilesError("Failed to load import files.");
            }
        } catch (e) {
            console.error(e);
            message.error("Failed to load import files.");
            setImportFilesError(e);
        } finally {
            setImportFilesLoading(false);
        }
    }

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [options]);

    return { importFilesResponse, importFilesError, importFilesLoading, importReviewForceReload: load };
}
