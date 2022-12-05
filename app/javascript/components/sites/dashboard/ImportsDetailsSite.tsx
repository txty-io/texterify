import { Layout, message, Skeleton } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { IGetImportResponse, ImportsAPI } from "../../api/v1/ImportsAPI";
import { Routes } from "../../routing/Routes";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Utils } from "../../ui/Utils";
import { ImportSidebar } from "../../ui/ImportSidebar";

export function ImportsDetailsSite() {
    const params = useParams<{ projectId: string; importId: string }>();

    const [importResponse, setImportResponse] = React.useState<IGetImportResponse>(null);
    const [importLoading, setImportLoading] = React.useState(false);

    async function load() {
        setImportLoading(true);

        try {
            const response = await ImportsAPI.detail({
                projectId: params.projectId,
                importId: params.importId
            });
            if (response.data) {
                setImportResponse(response);
            }
        } catch (e) {
            console.error(e);
            message.error("Failed to load import.");
        } finally {
            setImportLoading(false);
        }
    }

    React.useEffect(() => {
        (async function () {
            await load();
        })();
    }, [params.projectId, params.importId]);

    return (
        <>
            <Layout style={{ padding: "0", margin: "0", width: "100%", display: "flex", flexDirection: "row" }}>
                <ImportSidebar projectId={params.projectId} />

                <div style={{ padding: "0px 24px 24px", flexGrow: 1 }}>
                    <Breadcrumbs
                        breadcrumbName="importsDetails"
                        currentCrumbDescription={importResponse?.data.attributes.name}
                    />
                    <Layout.Content style={{ minHeight: 360, margin: "24px 16px 0px" }}>
                        <Link
                            to={Routes.DASHBOARD.PROJECT_IMPORTS_RESOLVER({ projectId: params.projectId })}
                            style={{ marginBottom: 16 }}
                        >
                            Back to imports
                        </Link>
                        {!importResponse || importLoading ? (
                            <Skeleton active loading />
                        ) : (
                            <>
                                <h1>{importResponse.data.attributes.name}</h1>
                                <div>{Utils.formatDateTime(importResponse.data.attributes.created_at)}</div>
                            </>
                        )}
                    </Layout.Content>
                </div>
            </Layout>
        </>
    );
}
