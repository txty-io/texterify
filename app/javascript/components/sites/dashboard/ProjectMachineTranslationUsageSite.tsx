import { Alert } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { MachineTranslationSidebar } from "../../ui/MachineTranslationSidebar";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";

export function ProjectMachineTranslationUsageSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <LayoutWithSidebar>
            <MachineTranslationSidebar projectId={params.projectId} />

            <LayoutWithSidebarContentWrapper>
                <Breadcrumbs breadcrumbName="projectMachineTranslationUsage" />
                <LayoutWithSidebarContentWrapperInner>
                    <h1>Usage</h1>
                    <p>
                        The current number of characters used in machine translation including translation suggestions.
                    </p>
                    <div style={{ display: "flex", fontSize: 16 }}>
                        <span style={{ fontWeight: "bold", marginRight: 24 }}>Usage:</span>
                        {dashboardStore.getProjectOrganization()?.attributes.machine_translation_character_usage}{" "}
                        characters
                    </div>

                    <h3 style={{ marginTop: 40 }}>Total usage</h3>
                    <p>This is the total amount of characters machine translated over all your projects.</p>
                    <div style={{ display: "flex", fontSize: 16 }}>
                        <span style={{ fontWeight: "bold", marginRight: 24 }}>Usage:</span>
                        {dashboardStore.getProjectOrganization()?.attributes.machine_translation_character_usage}/
                        {dashboardStore.getProjectOrganization()?.attributes.machine_translation_character_limit}{" "}
                        characters
                    </div>
                    {IS_TEXTERIFY_CLOUD && (
                        <Alert
                            showIcon
                            type="info"
                            message={
                                <>
                                    Your available machine translation characters are reset on the first of every month.
                                    If you need more monthly machine translation characters contact support via{" "}
                                    <a href="mailto:support@texterify.com" target="_blank">
                                        support@texterify.com
                                    </a>
                                    .
                                </>
                            }
                            style={{ marginTop: 24 }}
                        />
                    )}
                </LayoutWithSidebarContentWrapperInner>
            </LayoutWithSidebarContentWrapper>
        </LayoutWithSidebar>
    );
}
