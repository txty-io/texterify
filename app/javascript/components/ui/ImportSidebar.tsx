import { Tag } from "antd";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export function ImportSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            menuItems={[
                {
                    title: "Import",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_IMPORT_FILE,
                            name: "File",
                            id: "file"
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
