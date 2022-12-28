import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export function ImportSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "Import",
                    items: [
                        {
                            subMenuPath: Routes.DASHBOARD.PROJECT_IMPORTS.replace(":projectId", props.projectId),
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_IMPORTS.replace(":projectId", props.projectId),
                                    dataId: "imports",
                                    title: "Upload"
                                }
                            ]
                        },
                        {
                            subMenuTitle: "WordPress",
                            subMenuPath: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_RESOLVER({
                                projectId: props.projectId
                            }),
                            subMenuDataId: "wordpress",
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SYNC_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "Synchronize",
                                    dataId: "synchronize"
                                },
                                {
                                    path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "Settings",
                                    dataId: "settings"
                                }
                            ]
                        }
                        // {
                        //     paths: [
                        //         {
                        //             path: Routes.DASHBOARD.PROJECT_IMPORT_GITHUB.replace(":projectId", props.projectId),
                        //             dataId: "github",
                        //             disabled: true,
                        //             title: (
                        //                 <>
                        //                     GitHub <Tag style={{ marginLeft: 8 }}>coming soon</Tag>
                        //                 </>
                        //             )
                        //         }
                        //     ]
                        // }
                    ]
                }
            ]}
        />
    );
}
