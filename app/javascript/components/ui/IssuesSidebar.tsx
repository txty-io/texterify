import { Tag } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { SubSidebar } from "./SubSidebar";

export const IssuesSidebar = observer((props: { projectId: string }) => {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "Issues",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_ISSUES_ACTIVE.replace(":projectId", props.projectId),
                                    title: (
                                        <span>
                                            Issues
                                            {dashboardStore.featureEnabled("FEATURE_VALIDATIONS") && (
                                                <Tag
                                                    color={
                                                        dashboardStore.currentProject?.attributes.issues_count > 0
                                                            ? "var(--color-warn)"
                                                            : "var(--color-success)"
                                                    }
                                                    style={{ marginLeft: 16 }}
                                                >
                                                    {dashboardStore.currentProject?.attributes.issues_count}
                                                </Tag>
                                            )}
                                        </span>
                                    ),
                                    dataId: "issues-active"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_ISSUES_IGNORED.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Ignored issues",
                                    dataId: "issues-ignored"
                                }
                            ]
                        }
                    ]
                }
            ]}
        />
    );
});
