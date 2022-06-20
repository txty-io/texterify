import { Button, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { NewProjectForm } from "../../forms/NewProjectForm";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { LayoutWithSubSidebar } from "../../ui/LayoutWithSubSidebar";
import { LayoutWithSubSidebarInner } from "../../ui/LayoutWithSubSidebarInner";
import { LayoutWithSubSidebarInnerContent } from "../../ui/LayoutWithSubSidebarInnerContent";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { ProjectSettingsSidebar } from "./ProjectSettingsSidebar";

type IProps = RouteComponentProps<{ projectId: string }>;

@observer
class ProjectSettingsGeneralSite extends React.Component<IProps> {
    render() {
        return (
            <LayoutWithSubSidebar>
                <ProjectSettingsSidebar projectId={this.props.match.params.projectId} />

                <LayoutWithSubSidebarInner>
                    <Breadcrumbs breadcrumbName="projectSettingsGeneral" />
                    <LayoutWithSubSidebarInnerContent>
                        <h1>General settings</h1>
                        <SettingsSectionWrapper>
                            <NewProjectForm
                                isEdit
                                onChanged={() => {
                                    message.success("Successfully updated project settings.");
                                }}
                            />
                            <Button
                                form="newProjectForm"
                                type="primary"
                                htmlType="submit"
                                style={{ alignSelf: "flex-end" }}
                            >
                                Save
                            </Button>
                        </SettingsSectionWrapper>
                    </LayoutWithSubSidebarInnerContent>
                </LayoutWithSubSidebarInner>
            </LayoutWithSubSidebar>
        );
    }
}

export { ProjectSettingsGeneralSite };
