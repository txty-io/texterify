import * as React from "react";
import { Routes } from "../../routing/Routes";
import { SubSidebar } from "../../ui/SubSidebar";

export function ProjectSettingsSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            projectId={props.projectId}
            menuItems={[
                {
                    title: "Settings",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_SETTINGS_GENERAL_RESOLVER({ projectId: props.projectId }),
                            name: "General",
                            id: "settings-sidebar-general"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_SETTINGS_ADVANCED_RESOLVER({ projectId: props.projectId }),
                            name: "Advanced",
                            id: "settings-sidebar-advanced"
                        }
                    ]
                }
            ]}
        />
    );
}
