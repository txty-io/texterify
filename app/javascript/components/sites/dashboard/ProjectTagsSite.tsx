import { Skeleton } from "antd";
import * as React from "react";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";
import { TagsTable } from "../../ui/TagsTable";

export function ProjectTagsSite() {
    return (
        <>
            <LayoutWithSidebar>
                <LayoutWithSidebarContentWrapper>
                    <Breadcrumbs breadcrumbName="projectTags" />
                    <LayoutWithSidebarContentWrapperInner size="medium">
                        <h1>Tags</h1>

                        {!dashboardStore.currentProject && <Skeleton active />}

                        {dashboardStore.currentProject && !dashboardStore.featureEnabled("FEATURE_TAGS") && (
                            <FeatureNotAvailable
                                feature="FEATURE_TAGS"
                                dataId="FEATURE_TAGS_NOT_AVAILABLE"
                                style={{ marginBottom: 24 }}
                            />
                        )}

                        {dashboardStore.currentProject && dashboardStore.featureEnabled("FEATURE_TAGS") && (
                            <TagsTable project={dashboardStore.currentProject} />
                        )}
                    </LayoutWithSidebarContentWrapperInner>
                </LayoutWithSidebarContentWrapper>
            </LayoutWithSidebar>
        </>
    );
}
