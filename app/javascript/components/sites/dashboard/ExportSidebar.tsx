import { Tag } from "antd";
import * as React from "react";
import { Routes } from "../../routing/Routes";
import { SubSidebar } from "../../ui/SubSidebar";

export function ExportSidebar(props: { projectId: string }) {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "Export",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_EXPORT_DOWNLOAD.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Download",
                                    dataId: "download"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Export configs",
                                    dataId: "configurations"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_EXPORT_FLAVORS.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Flavors",
                                    dataId: "flavors"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_EXPORT_HIERARCHY.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Hierarchy",
                                    dataId: "hierarchy"
                                }
                            ]
                        }
                    ]
                },
                {
                    menuTitle: "Integrations",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "WordPress",
                                    dataId: "wordpress"
                                }
                            ]
                        }
                    ]
                }
            ]}
        />
    );
}
