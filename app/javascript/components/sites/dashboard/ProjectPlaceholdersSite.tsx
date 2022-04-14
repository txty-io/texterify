import { Button, Skeleton } from "antd";
import * as React from "react";
import { useParams } from "react-router";
import { PlaceholderSettingsForm } from "../../forms/PlaceholderSettingsForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { ValidationsSidebar } from "../../ui/ValidationsSidebar";

function ProjectPlaceholdersSite() {
    const params = useParams<{ projectId: string }>();

    const [loading, setLoading] = React.useState<boolean>(false);

    return (
        <LayoutWithSubSidebar>
            <ValidationsSidebar projectId={params.projectId} />

            <LayoutWithSubSidebarInner smallWidth>
                <Breadcrumbs breadcrumbName="projectPlaceholders" />
                <LayoutWithSubSidebarInnerContent verySmallWidth>
                    <h1>Placeholders</h1>
                    <p>Define the format of your placeholders.</p>
                    {/* <a href={Routes.OTHER.PLACEHOLDERS} target="_blank" style={{ alignSelf: "flex-start" }}>
                        Learn more here
                    </a> */}
                    {!dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                        <FeatureNotAvailable
                            feature="FEATURE_VALIDATIONS"
                            dataId="FEATURE_VALIDATIONS_NOT_AVAILABLE"
                            style={{ marginBottom: 24 }}
                        />
                    )}
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
                                    disabled={!dashboardStore.featureEnabled("FEATURE_VALIDATIONS")}
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

export { ProjectPlaceholdersSite };
