import * as React from "react";
import { useParams } from "react-router";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ExportConfigsTable } from "../../ui/ExportConfigsTable";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { ExportSidebar } from "./ExportSidebar";

export function ProjectExportConfigsSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <LayoutWithSubSidebar>
            <ExportSidebar projectId={params.projectId} />

            <LayoutWithSubSidebarInner>
                <Breadcrumbs breadcrumbName="projectExportConfigurations" />
                <LayoutWithSubSidebarInnerContent>
                    <h1>Export configs</h1>
                    <p>Specify in which formats you can export your translations.</p>

                    <ExportConfigsTable project={dashboardStore.currentProject} />
                </LayoutWithSubSidebarInnerContent>
            </LayoutWithSubSidebarInner>
        </LayoutWithSubSidebar>
    );
}
