import { Tag } from "antd";
import * as React from "react";
import { Routes } from "../../routing/Routes";
import { SubSidebar } from "../../ui/SubSidebar";

export function ExportSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            menuItems={[
                {
                    title: "Export",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_EXPORT.replace(":projectId", props.projectId),
                            name: "Download",
                            id: "download"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(":projectId", props.projectId),
                            name: "Configurations",
                            id: "configurations"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY.replace(":projectId", props.projectId),
                            name: "Hierarchy",
                            id: "hierarchy"
                        }
                    ]
                },
                {
                    title: "Integrations",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_RESOLVER({
                                projectId: props.projectId
                            }),
                            name: (
                                <>
                                    WordPress <Tag style={{ marginLeft: 8 }}>beta</Tag>
                                </>
                            ),
                            id: "wordpress"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_IMPORT_GITHUB,
                            disabled: true,
                            name: (
                                <>
                                    GitHub <Tag style={{ marginLeft: 8 }}>coming soon</Tag>
                                </>
                            ),
                            id: "github"
                        }
                    ]
                }
            ]}
        />
    );
}
