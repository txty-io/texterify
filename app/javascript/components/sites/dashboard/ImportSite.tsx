import { Layout, Tabs } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { Routes } from "../../routing/Routes";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { TranslationFileImporter } from "../../ui/TranslationFileImporter";
import { WordpressContentsTable } from "../../ui/WordpressContentsTable";

export type ImportFileFormats =
    | "json"
    | "json-nested"
    | "json-formatjs"
    | "ios"
    | "android"
    | "toml"
    | "rails"
    | "properties"
    | "po";

export function ImportSite() {
    const params = useParams<{ projectId: string }>();

    const [activeTab, setActiveTab] = React.useState<string>("file");

    return (
        <>
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="import" />
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Import</h1>
                    <p>Import content into Texterify.</p>
                    <Tabs
                        activeKey={activeTab}
                        tabPosition="left"
                        style={{ height: "100%", marginTop: 24 }}
                        onTabClick={(activeKey) => {
                            setActiveTab(activeKey);
                        }}
                        className="no-tab-left-padding"
                    >
                        <Tabs.TabPane key="file" tabKey="file" tab="File import">
                            <h2>Import a translation file</h2>
                            <TranslationFileImporter />
                        </Tabs.TabPane>
                        <Tabs.TabPane key="wordpress" tabKey="wordpress" tab="WordPress import">
                            <h2>Import content from WordPress</h2>
                            <a href={Routes.OTHER.WORDPRESS_INTEGRATION_GUIDE} target="_blank">
                                Learn more
                            </a>
                            <WordpressContentsTable projectId={params.projectId} style={{ marginTop: 8 }} />
                        </Tabs.TabPane>
                    </Tabs>
                </Layout.Content>
            </Layout>
        </>
    );
}
