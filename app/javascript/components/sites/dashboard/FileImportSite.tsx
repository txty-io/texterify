import { Layout } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ImportSidebar } from "../../ui/ImportSidebar";
import { TranslationFileImporter } from "../../ui/TranslationFileImporter";

export type ImportFileFormats =
    | "json"
    | "json-formatjs"
    | "json-poeditor"
    | "ios"
    | "android"
    | "toml"
    | "rails"
    | "properties"
    | "po"
    | "arb";

export function FileImportSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <>
            <Layout style={{ padding: "0", margin: "0", width: "100%", display: "flex", flexDirection: "row" }}>
                <ImportSidebar projectId={params.projectId} />

                <div style={{ padding: "0px 24px 24px", flexGrow: 1 }}>
                    <Breadcrumbs breadcrumbName="import" />
                    <Layout.Content style={{ minHeight: 360, margin: "24px 16px 0px" }}>
                        <h2>Import a translation file</h2>
                        <TranslationFileImporter />
                    </Layout.Content>
                </div>
            </Layout>
        </>
    );
}
