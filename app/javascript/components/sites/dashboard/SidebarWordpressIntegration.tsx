import * as React from "react";
import { Routes } from "../../routing/Routes";
import { SubSidebar } from "../../ui/SubSidebar";

export function SidebarWordpressIntegration(props: { projectId: string }) {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "WordPress",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "Settings",
                                    dataId: "settings"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SYNC_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "Synchronize",
                                    dataId: "synchronize"
                                }
                            ]
                        }
                    ]
                }
            ]}
        />
    );
}
