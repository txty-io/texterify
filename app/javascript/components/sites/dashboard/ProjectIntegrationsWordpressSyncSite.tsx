import * as React from "react";
import { useParams } from "react-router";
import { Routes } from "../../routing/Routes";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { WordpressContentsTable } from "../../ui/WordpressContentsTable";
import { SidebarWordpressIntegration } from "./SidebarWordpressIntegration";

export function ProjectIntegrationsWordpressSyncSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <>
            <LayoutWithSubSidebar>
                <SidebarWordpressIntegration projectId={params.projectId} />

                <LayoutWithSubSidebarInner>
                    <Breadcrumbs breadcrumbName="projectIntegrationsWordpressSync" />
                    <LayoutWithSubSidebarInnerContent>
                        <h1>Sync content with WordPress</h1>
                        <a
                            href={Routes.OTHER.WORDPRESS_INTEGRATION_GUIDE}
                            target="_blank"
                            style={{ alignSelf: "flex-start" }}
                        >
                            Learn more
                        </a>
                        <WordpressContentsTable projectId={params.projectId} style={{ marginTop: 8 }} />
                    </LayoutWithSubSidebarInnerContent>
                </LayoutWithSubSidebarInner>
            </LayoutWithSubSidebar>
        </>
    );
}
