import * as React from "react";
import { useParams } from "react-router";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { MachineTranslationSidebar } from "../../ui/MachineTranslationSidebar";
import { OrganizationMachineTranslationTotalUsage } from "../../ui/OrganizationMachineTranslationTotalUsage";

export function ProjectMachineTranslationUsageSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <LayoutWithSidebar>
            <MachineTranslationSidebar projectId={params.projectId} />

            <LayoutWithSidebarContentWrapper>
                <Breadcrumbs breadcrumbName="projectMachineTranslationUsage" />
                <LayoutWithSidebarContentWrapperInner>
                    <h1>Usage</h1>
                    <p>Machine translation character usage of the current project.</p>
                    <div style={{ display: "flex", fontSize: 16 }}>
                        <span style={{ fontWeight: "bold", marginRight: 24 }}>Usage:</span>
                        {dashboardStore.currentProject?.attributes.machine_translation_character_usage} characters
                    </div>

                    <OrganizationMachineTranslationTotalUsage
                        organization={dashboardStore.getProjectOrganization()}
                        style={{ marginTop: 40 }}
                    />
                </LayoutWithSidebarContentWrapperInner>
            </LayoutWithSidebarContentWrapper>
        </LayoutWithSidebar>
    );
}
