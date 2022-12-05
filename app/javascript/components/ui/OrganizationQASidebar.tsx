import { observer } from "mobx-react";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export const OrganizationQASidebar = observer((props: { organizationId: string }) => {
    return (
        <SubSidebar
            menuItems={[
                {
                    menuTitle: "QA",
                    items: [
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.ORGANIZATION_VALIDATIONS_RESOLVER({
                                        organizationId: props.organizationId
                                    }),
                                    title: "Validations",
                                    dataId: "organization-qa-sidebar-validations"
                                }
                            ]
                        },
                        {
                            paths: [
                                {
                                    path: Routes.DASHBOARD.ORGANIZATION_FORBIDDEN_WORDS_RESOLVER({
                                        organizationId: props.organizationId
                                    }),
                                    title: "Forbidden words",
                                    dataId: "organization-qa-sidebar-forbidden-words"
                                }
                            ]
                        }
                    ]
                }
            ]}
        />
    );
});
