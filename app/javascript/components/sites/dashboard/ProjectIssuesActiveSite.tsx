import * as React from "react";
import { useParams } from "react-router";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { IssuesSidebar } from "../../ui/IssuesSidebar";
import { IssuesTable } from "../../ui/IssuesTable";
import { LayoutWithSidebar } from "../../ui/LayoutWithSidebar";
import { LayoutWithSidebarContentWrapper } from "../../ui/LayoutWithSidebarContentWrapper";
import { LayoutWithSidebarContentWrapperInner } from "../../ui/LayoutWithSidebarContentWrapperInner";

export function ProjectIssuesActiveSite() {
    const params = useParams<{ projectId: string }>();

    return (
        <LayoutWithSidebar>
            <IssuesSidebar projectId={params.projectId} />

            <LayoutWithSidebarContentWrapper>
                <Breadcrumbs breadcrumbName="projectActiveIssues" />
                <LayoutWithSidebarContentWrapperInner>
                    <h1>Issues</h1>

                    <IssuesTable projectId={params.projectId} issuesType="unignored" />
                </LayoutWithSidebarContentWrapperInner>
            </LayoutWithSidebarContentWrapper>
        </LayoutWithSidebar>
    );
}
