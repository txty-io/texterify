import { Button, Skeleton } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { PlaceholderSettingsForm } from "../../forms/PlaceholderSettingsForm";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { ProjectSettingsSidebar } from "./ProjectSettingsSidebar";

function ProjectSettingsPlaceholdersSite() {
    const params = useParams<{ projectId: string }>();

    const [loading, setLoading] = React.useState<boolean>(false);

    return (
        <LayoutWithSubSidebar>
            <ProjectSettingsSidebar projectId={params.projectId} />

            <LayoutWithSubSidebarInner smallWidth>
                <Breadcrumbs breadcrumbName="projectSettingsPlaceholders" />
                <LayoutWithSubSidebarInnerContent verySmallWidth>
                    <h1>Placeholder settings</h1>
                    <p>Define the format of your placeholders.</p>
                    {/* <a href={Routes.OTHER.PLACEHOLDERS} target="_blank" style={{ alignSelf: "flex-start" }}>
                        Learn more here
                    </a> */}
                    <SettingsSectionWrapper>
                        {!dashboardStore.currentProject && <Skeleton active />}
                        {dashboardStore.currentProject && (
                            <>
                                <PlaceholderSettingsForm
                                    projectId={params.projectId}
                                    placeholderStart={dashboardStore.currentProject.attributes.placeholder_start}
                                    placeholderEnd={dashboardStore.currentProject.attributes.placeholder_end}
                                    onSaving={() => {
                                        setLoading(true);
                                    }}
                                    onSaved={() => {
                                        setLoading(false);
                                    }}
                                />
                                <Button
                                    form="placeholderSettingsForm"
                                    type="primary"
                                    htmlType="submit"
                                    style={{ alignSelf: "flex-end" }}
                                    loading={loading}
                                >
                                    Save
                                </Button>
                            </>
                        )}
                    </SettingsSectionWrapper>
                </LayoutWithSubSidebarInnerContent>
            </LayoutWithSubSidebarInner>
        </LayoutWithSubSidebar>
    );
}

export { ProjectSettingsPlaceholdersSite };
