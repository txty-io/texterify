import { Tag } from "antd";
import * as React from "react";
import { Routes } from "../../routing/Routes";
import { SubSidebar } from "../../ui/SubSidebar";

export function ExportSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            projectId={props.projectId}
            menuItems={[
                {
                    title: "Export",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_EXPORT.replace(":projectId", props.projectId),
                            name: "Download"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(":projectId", props.projectId),
                            name: "Configurations"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY.replace(":projectId", props.projectId),
                            name: "Hierarchy"
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
                            disabled: true,
                            name: (
                                <>
                                    WordPress <Tag style={{ marginLeft: 8 }}>coming soon</Tag>
                                </>
                            )
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_IMPORT_GITHUB,
                            disabled: true,
                            name: (
                                <>
                                    GitHub <Tag style={{ marginLeft: 8 }}>coming soon</Tag>
                                </>
                            )
                        }
                    ]
                }
            ]}
        />
    );
}
