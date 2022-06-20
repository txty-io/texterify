import { Button, Empty, List, Tooltip } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { ListContent } from "./ListContent";
import { ProjectAvatar } from "./ProjectAvatar";
import styled from "styled-components";
import { IProject } from "../api/v1/ProjectsAPI";
import { AlertFilled, ExclamationCircleFilled } from "@ant-design/icons";

const openProject = (project: IProject) => {
    dashboardStore.currentProject = project;
    history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", project.id));
};

const ProjectInfoWrapper = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;

    .dark-theme & {
        color: #fff;
    }
`;

function ProjectsList(props: {
    loading: boolean;
    projects: IProject[];
    included?: any[];
    disableSort?: boolean;
    style?: React.CSSProperties;
}) {
    return (
        <List
            size="default"
            loading={props.loading}
            locale={{ emptyText: <Empty description="No projects found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            style={props.style}
            dataSource={props.projects
                .sort((a, b) => {
                    if (props.disableSort) {
                        return 0;
                    }

                    return a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : 1;
                })
                .map((project: any) => {
                    return {
                        key: project.id,
                        name: project.attributes.name,
                        description: project.attributes.description
                    };
                }, [])}
            renderItem={(item) => {
                const project = _.find(props.projects, { id: item.key });
                const projectOrganization =
                    props.included &&
                    APIUtils.getIncludedObject(project.relationships.organization.data, props.included);

                return (
                    <List.Item key={item.key} data-id={`project-${item.key}`}>
                        <List.Item.Meta
                            style={{ overflow: "hidden" }}
                            title={
                                <ListContent
                                    onClick={() => {
                                        openProject(project);
                                    }}
                                    role="button"
                                >
                                    <ProjectAvatar project={project} style={{ marginRight: 16 }} />
                                    <ProjectInfoWrapper>
                                        {projectOrganization ? `${projectOrganization.attributes.name} / ` : ""}
                                        <span style={{ fontWeight: props.included ? "bold" : undefined }}>
                                            {item.name}
                                        </span>
                                        <div style={{ textOverflow: "ellipsis", overflow: "hidden", fontSize: 12 }}>
                                            {item.description}
                                        </div>
                                    </ProjectInfoWrapper>
                                </ListContent>
                            }
                        />
                        {project.attributes.current_user_deactivated && (
                            <Tooltip title="Your account has been disabled for this project.">
                                <ExclamationCircleFilled style={{ color: "var(--color-warn)", marginRight: 24 }} />
                            </Tooltip>
                        )}
                        <Button
                            onClick={() => {
                                openProject(project);
                            }}
                        >
                            More
                        </Button>
                    </List.Item>
                );
            }}
        />
    );
}

export { ProjectsList };
