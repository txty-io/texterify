import { observer } from "mobx-react";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export const MachineTranslationSidebar = observer((props: { projectId: string }) => {
    return (
        <SubSidebar
            menuItems={[
                {
                    title: "Machine translation",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION.replace(":projectId", props.projectId),
                            name: "Translate",
                            id: "machine-translation-translate"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_SETTINGS.replace(
                                ":projectId",
                                props.projectId
                            ),
                            name: "Settings",
                            id: "machine-translation-settings"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_MACHINE_TRANSLATION_USAGE.replace(
                                ":projectId",
                                props.projectId
                            ),
                            name: "Usage",
                            id: "machine-translation-usage"
                        }
                    ]
                }
            ]}
        />
    );
});
