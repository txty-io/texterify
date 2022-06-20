import { observer } from "mobx-react";
import * as React from "react";
import { Routes } from "../routing/Routes";
import { SubSidebar } from "./SubSidebar";

export const OrganizationQASidebar = observer((props: { organizationId: string }) => {
    return (
        <SubSidebar
            menuItems={[
                {
                    title: "QA",
                    items: [
                        {
                            path: Routes.DASHBOARD.ORGANIZATION_VALIDATIONS_RESOLVER({
                                organizationId: props.organizationId
                            }),
                            name: "Validations",
                            id: "organization-qa-sidebar-validations"
                        },
                        {
                            path: Routes.DASHBOARD.ORGANIZATION_FORBIDDEN_WORDS_RESOLVER({
                                organizationId: props.organizationId
                            }),
                            name: "Forbidden words",
                            id: "organization-qa-sidebar-forbidden-words"
                        }
                    ]
                }
            ]}
        />
    );
});
