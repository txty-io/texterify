import { observer } from "mobx-react";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export const MachineTranslationSidebar = observer((props: { projectId: string }) => {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "Machine translation",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Translate",
                                    dataId: "machine-translation-translate"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_SETTINGS.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Settings",
                                    dataId: "machine-translation-settings"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_USAGE.replace(
                                        ":projectId",
                                        props.projectId
                                    ),
                                    title: "Usage",
                                    dataId: "machine-translation-usage"
                                }
                            ]
                        }
                    ]
                }
            ]}
        />
    );
});
