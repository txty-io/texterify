import { observer } from "mobx-react";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export const ValidationsSidebar = observer((props: { projectId: string }) => {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "QA",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_VALIDATIONS.replace(":projectId", props.projectId),
                                    title: "Validations",
                                    dataId: "validations-sidebar-validations"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_PLACEHOLDERS_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "Placeholders",
                                    dataId: "validations-sidebar-placeholders"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.PROJECT_FORBIDDEN_WORDS_RESOLVER({
                                        projectId: props.projectId
                                    }),
                                    title: "Forbidden words",
                                    dataId: "validations-sidebar-forbidden-words-lists"
                                }
                            ]
                        }
                    ]
                }
            ]}
        />
    );
});
