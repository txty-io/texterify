import * as React from "react";
import { useParams } from "react-router";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FlavorsTable } from "../../ui/FlavorsTable";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { ExportSidebar } from "./ExportSidebar";

export function ProjectExportFlavorsSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <LayoutWithSubSidebar>
            <ExportSidebar projectId={params.projectId} />

            <LayoutWithSubSidebarInner>
                <Breadcrumbs breadcrumbName="projectExportFlavors" />
                <LayoutWithSubSidebarInnerContent>
                    <h1>Flavors</h1>
                    <p>
                        Flavors let you override specific translations and enables easy whitelabeling of your product.
                    </p>

                    <FlavorsTable project={dashboardStore.currentProject} />
                </LayoutWithSubSidebarInnerContent>
            </LayoutWithSubSidebarInner>
        </LayoutWithSubSidebar>
    );
}
