import { observer } from "mobx-react";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export const ValidationsSidebar = observer((props: { projectId: string }) => {
    return (
        <SubSidebar
            menuItems={[
                {
                    title: "QA",
                    items: [
                        {
                            path: Routes.DASHBOARD.PROJECT_VALIDATIONS.replace(":projectId", props.projectId),
                            name: "Validations",
                            id: "validations-sidebar-validations"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_PLACEHOLDERS_RESOLVER({ projectId: props.projectId }),
                            name: "Placeholders",
                            id: "validations-sidebar-placeholders"
                        },
                        {
                            path: Routes.DASHBOARD.PROJECT_FORBIDDEN_WORDS_RESOLVER({
                                projectId: props.projectId
                            }),
                            name: "Forbidden words",
                            id: "validations-sidebar-forbidden-words-lists"
                        }
                    ]
                }
            ]}
        />
    );
});
