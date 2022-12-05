import * as React from "react";
import { Routes } from "../../routing/Routes";
import { SubSidebar } from "../../ui/SubSidebar";

export function ProjectSettingsSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "Settings",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_SETTINGS_GENERAL_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "General",
                                    dataId: "settings-sidebar-general"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_SETTINGS_ADVANCED_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "Advanced",
                                    dataId: "settings-sidebar-advanced"
                                }
                            ]
                        }
                    ]
                }
            ]}
        />
    );
}
