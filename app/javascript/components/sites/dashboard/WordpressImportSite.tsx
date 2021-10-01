import { Layout } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { Routes } from "../../routing/Routes";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ImportSidebar } from "../../ui/ImportSidebar";
import { WordpressContentsTable } from "../../ui/WordpressContentsTable";

export function WordpressImportSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <>
            <Layout style={{ padding: "0", margin: "0", width: "100%", display: "flex", flexDirection: "row" }}>
                <ImportSidebar projectId={params.projectId} />

                <div style={{ padding: "0px 24px 24px", flexGrow: 1 }}>
                    <Breadcrumbs breadcrumbName="import" />
                    <Layout.Content style={{ minHeight: 360, margin: "24px 16px 0px" }}>
                        <h2>Import content from WordPress</h2>
                        <a href={Routes.OTHER.WORDPRESS_INTEGRATION_GUIDE} target="_blank">
                            Learn more
                        </a>
                        <WordpressContentsTable projectId={params.projectId} style={{ marginTop: 8 }} />
                    </Layout.Content>
                </div>
            </Layout>
        </>
    );
}
