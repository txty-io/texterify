import { Layout } from "antd";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { TranslationFileImporter } from "../../ui/TranslationFileImporter";

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

type IProps = RouteComponentProps<{ projectId: string }>;
class ImportSite extends React.Component<IProps> {
    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="import" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                        <h1>Import</h1>
                        <p>Select a file to import for a given language and optionally an export config.</p>
                        <TranslationFileImporter />
                    </Layout.Content>
                </Layout>
            </>
        );
    }
}

export { ImportSite };
