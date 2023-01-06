import { Layout } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ImportSidebar } from "../../ui/ImportSidebar";
import { ImportsTable } from "../../ui/ImportsTable";
import { TranslationFileImporter } from "../../ui/TranslationFileImporter";

export function ImportsSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <>
            <Layout style={{ padding: "0", margin: "0", width: "100%", display: "flex", flexDirection: "row" }}>
                <ImportSidebar projectId={params.projectId} />

                <div style={{ padding: "0px 24px 24px", flexGrow: 1 }}>
                    <Breadcrumbs breadcrumbName="imports" />
                    <Layout.Content style={{ minHeight: 360, margin: "24px 16px 0px" }}>
                        <h2>Upload your translation files</h2>
                        <TranslationFileImporter projectId={params.projectId} fileDropOnly />
                        <ImportsTable style={{ marginTop: 24 }} project={dashboardStore.currentProject} />
                    </Layout.Content>
                </div>
            </Layout>
        </>
    );
}
