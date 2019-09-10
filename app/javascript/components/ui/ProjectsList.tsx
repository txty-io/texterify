import { Button, Empty, List } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { ListContent } from "./ListContent";
import { ProjectAvatar } from "./ProjectAvatar";

const openProject = (project: any) => {
    dashboardStore.currentProject = project;
    history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", project.id));
};

function ProjectsList(props: { projects: any[] }) {
    return (
        <List
            size="small"
            locale={{ emptyText: <Empty description="No projects found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            dataSource={props.projects.map((project: any) => {
                return {
                    key: project.id,
                    name: project.attributes.name,
                    description: project.attributes.description
                };
            }, [])}
            renderItem={(item) => {
                const project = _.find(props.projects, { id: item.key });

                return (
                    <List.Item key={item.key}>
                        <List.Item.Meta
                            style={{ overflow: "hidden" }}
                            title={
                                <ListContent
                                    onClick={() => { openProject(project); }}
                                    role="button"
                                >
                                    <ProjectAvatar
                                        project={project}
                                        style={{ marginRight: 16 }}
                                    />
                                    <div style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                                        {item.name}
                                        <div style={{ textOverflow: "ellipsis", overflow: "hidden", fontSize: 12 }}>
                                            {item.description}
                                        </div>
                                    </div>
                                </ListContent>
                            }
                        />
                        <Button onClick={() => { openProject(project); }}>
                            More
                        </Button>
                    </List.Item>
                );
            }}
        />
    );
}

export { ProjectsList };
