import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { IGetImportOptions, IGetImportResponse, ImportsAPI } from "../api/v1/ImportsAPI";

export default function useImport(options: IGetImportOptions) {
    const [importResponse, setImportResponse] = React.useState<IGetImportResponse>(null);
    const [importError, setImportError] = React.useState(null);
    const [importLoading, setImportLoading] = React.useState(false);

    async function load() {
        setImportLoading(true);

        try {
            const data = await ImportsAPI.detail(options);
            setImportResponse(data);
        } catch (e) {
            setImportError(e);
            console.error(e);
            message.error("Failed to load import.");
        } finally {
            setImportLoading(false);
        }
    }

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [options]);

    return { importResponse, importError, importLoading, importForceReload: load };
}
