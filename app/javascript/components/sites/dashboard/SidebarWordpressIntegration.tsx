import * as React from "react";
import { Routes } from "../../routing/Routes";
import { SubSidebar } from "../../ui/SubSidebar";

export function SidebarWordpressIntegration(props: { projectId: string }) {
    return (
        <SubSidebar
            projectId={props.projectId}
            menuItems={[
                {
                    title: "WordPress",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS_RESOLVER({
                                projectId: props.projectId
                            }),
                            name: "Settings",
                            id: "settings"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SYNC_RESOLVER({
                                projectId: props.projectId
                            }),
                            name: "Synchronize",
                            id: "synchronize"
                        }
                    ]
                }
            ]}
        />
    );
}
