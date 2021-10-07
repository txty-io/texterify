import { Tag } from "antd";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export function ImportSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            projectId={props.projectId}
            menuItems={[
                {
                    title: "Import",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_IMPORT_FILE,
                            name: "File"
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
