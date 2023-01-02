import { Alert, Button, Layout, notification, Result, Skeleton } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { IGetImportResponse, IImportFile } from "../../api/v1/ImportsAPI";
import useImport from "../../hooks/useImport";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { BackButton } from "../../ui/BackButton";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Constants } from "../../ui/Constants";
import { ImportFileAssigner } from "../../ui/ImportFileAssigner";
import { ImportFilesTable } from "../../ui/ImportFilesTable";
import { ImportReviewTable } from "../../ui/ImportReviewTable";
import { ImportSidebar } from "../../ui/ImportSidebar";
import { Loading } from "../../ui/Loading";
import { Utils } from "../../ui/Utils";

function ImportStatusChecker(props: { text: string; importReloader(): void }) {
    React.useEffect(() => {
        const interval = setInterval(() => {
            props.importReloader();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return <Loading text={props.text} />;
}

function ImportDetailsContent(props: {
    importResponse: IGetImportResponse;
    importLoading: boolean;
    projectId: string;
    importId: string;
    onAssigningComplete(): void;
    onImport(): void;
    importReloader(): void;
}) {
    if (!props.importResponse) {
        return <Skeleton active loading />;
    } else if (props.importResponse.data.attributes.status === "VERIFYING") {
        return <ImportStatusChecker importReloader={props.importReloader} text="Verifying import..." />;
    } else if (props.importResponse.data.attributes.status === "IMPORTING") {
        return <ImportStatusChecker importReloader={props.importReloader} text="Importing..." />;
    } else if (props.importResponse.data.attributes.status === "VERIFIED") {
        return (
            <>
                <h3>Imported files</h3>
                <ImportFilesTable projectId={props.projectId} importId={props.importId} showImportFailedOnesLaterHint />
                <h3 style={{ marginTop: 24 }}>New translations</h3>
                <ImportReviewTable projectId={props.projectId} importId={props.importId} onImport={props.onImport} />
            </>
        );
    } else if (props.importResponse.data.attributes.status === "ERROR") {
        return (
            <>
                <ImportFilesTable projectId={props.projectId} importId={props.importId} />

                <Result
                    style={{ marginTop: 40 }}
                    status="error"
                    title="None of your uploaded files could be imported."
                    subTitle={props.importResponse.data.attributes.name}
                    extra={[
                        <Button
                            type="primary"
                            key="upload-more"
                            onClick={() => {
                                history.push(Routes.DASHBOARD.PROJECT_IMPORTS_RESOLVER({ projectId: props.projectId }));
                            }}
                        >
                            Try again
                        </Button>
                    ]}
                />

                <Alert
                    style={{ marginTop: 40, maxWidth: "100%" }}
                    showIcon
                    type="info"
                    message={
                        <>
                            If you are having problems importing your files feel free to open a ticket{" "}
                            <a href={Constants.GITHUB_ISSUES_SITE} target="_blank">
                                here
                            </a>
                            .
                        </>
                    }
                />
            </>
        );
    } else if (props.importResponse.data.attributes.status === "IMPORTED") {
        return (
            <>
                <h3>Imported files</h3>
                <ImportFilesTable projectId={props.projectId} importId={props.importId} />

                <Result
                    style={{ marginTop: 40 }}
                    status="success"
                    title="Your import was successful."
                    subTitle={props.importResponse.data.attributes.name}
                    extra={[
                        <Button
                            type="primary"
                            key="go-to-key"
                            onClick={() => {
                                history.push(Routes.DASHBOARD.PROJECT_KEYS_RESOLVER({ projectId: props.projectId }));
                            }}
                        >
                            Go to keys
                        </Button>,
                        <Button
                            key="upload-more"
                            onClick={() => {
                                history.push(Routes.DASHBOARD.PROJECT_IMPORTS_RESOLVER({ projectId: props.projectId }));
                            }}
                        >
                            Upload more files
                        </Button>
                    ]}
                />
            </>
        );
    } else if (props.importLoading) {
        return <Skeleton active loading />;
    } else {
        return (
            <>
                <h1>{props.importResponse.data.attributes.name}</h1>
                <div style={{ color: "var(--color-passive)" }}>
                    Uploaded at: {Utils.formatDateTime(props.importResponse.data.attributes.created_at)}
                </div>
                <p style={{ marginTop: 8 }}>
                    Please specify the file formats and languages of your uploaded files so we can import them
                    correctly.
                </p>
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
                            onImport={async () => {
                                await importForceReload();
                            }}
                            importReloader={importForceReload}
                            projectId={params.projectId}
                            importId={params.importId}
                        />
                    </Layout.Content>
                </div>
            </Layout>
        </>
    );
}
