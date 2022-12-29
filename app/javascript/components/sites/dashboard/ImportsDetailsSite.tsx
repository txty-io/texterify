import { Layout, Skeleton } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { IGetImportResponse } from "../../api/v1/ImportsAPI";
import useImport from "../../hooks/useImport";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { BackButton } from "../../ui/BackButton";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ImportFileAssigner } from "../../ui/ImportFileAssigner";
import { ImportSidebar } from "../../ui/ImportSidebar";
import { Loading } from "../../ui/Loading";
import { Utils } from "../../ui/Utils";

function ImportVerifyingChecker(props: { importReloader(): void }) {
    React.useEffect(() => {
        const interval = setInterval(() => {
            props.importReloader();
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return <Loading text="Verifying import..." />;
}

function ImportDetailsContent(props: {
    importResponse: IGetImportResponse;
    importLoading: boolean;
    onAssigningComplete(): void;
    importReloader(): void;
}) {
    if (!props.importResponse) {
        return <Skeleton active loading />;
    } else if (props.importResponse.data.attributes.status === "VERIFYING") {
        return <ImportVerifyingChecker importReloader={props.importReloader} />;
    } else if (props.importLoading) {
        return <Skeleton active loading />;
    } else {
        return (
            <>
                <h1>{props.importResponse.data.attributes.name}</h1>
                <div style={{ color: "var(--color-passive)" }}>
                    Created at: {Utils.formatDateTime(props.importResponse.data.attributes.created_at)}
                </div>
                <div>Status: {props.importResponse.data.attributes.status}</div>
                {props.importResponse.data.attributes.status === "CREATED" && (
                    <ImportFileAssigner
                        importResponse={props.importResponse}
                        importLoading={props.importLoading}
                        onAssigningComplete={props.onAssigningComplete}
                    />
                )}
            </>
        );
    }
}

export function ImportsDetailsSite() {
    const params = useParams<{ projectId: string; importId: string }>();

    const { importResponse, importLoading, importError, importForceReload } = useImport({
        projectId: params.projectId,
        importId: params.importId
    });

    if (importError) {
        history.push(Routes.DASHBOARD.PROJECT_IMPORTS_RESOLVER({ projectId: params.projectId }));
    }

    return (
        <>
            <Layout style={{ padding: "0", margin: "0", width: "100%", display: "flex", flexDirection: "row" }}>
                <ImportSidebar projectId={params.projectId} />

                <div style={{ padding: "0px 24px 24px", flexGrow: 1 }}>
                    <Breadcrumbs
                        breadcrumbName="importsDetails"
                        currentCrumbDescription={importResponse?.data?.attributes.name}
                    />
                    <Layout.Content style={{ minHeight: 360, margin: "24px 16px 0px" }}>
                        <BackButton
                            route={Routes.DASHBOARD.PROJECT_IMPORTS_RESOLVER({ projectId: params.projectId })}
                        />
                        <ImportDetailsContent
                            importResponse={importResponse}
                            importLoading={importLoading}
                            onAssigningComplete={async () => {
                                await importForceReload();
                            }}
                            importReloader={importForceReload}
                        />
                    </Layout.Content>
                </div>
            </Layout>
        </>
    );
}
