import { message } from "antd";
import * as React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { FlavorsAPI, IGetFlavorsOptions, IGetFlavorsResponse } from "../api/v1/FlavorsAPI";

export default function useFlavors(projectId: string, options?: IGetFlavorsOptions) {
    const [flavorsResponse, setFlavorsResponse] = React.useState<IGetFlavorsResponse>(null);
    const [flavorsError, setFlavorsError] = React.useState(null);
    const [flavorsLoading, setFlavorsLoading] = React.useState(false);

    async function load() {
        setFlavorsLoading(true);

        try {
            const data = await FlavorsAPI.getFlavors({
                projectId: projectId,
                options: options
            });
            setFlavorsResponse(data);
        } catch (e) {
            setFlavorsError(e);
            console.error(e);
            message.error("Failed to load flavors.");
        } finally {
            setFlavorsLoading(false);
        }
    }

    useDeepCompareEffect(() => {
        (async function () {
            await load();
        })();
    }, [projectId, options]);

    return { flavorsResponse, flavorsError, flavorsLoading, flavorsForceReload: load };
}
