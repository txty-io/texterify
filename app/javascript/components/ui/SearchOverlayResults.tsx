import { Empty } from "antd";
import * as React from "react";
import styled from "styled-components";
import { APIUtils } from "../api/v1/APIUtils";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { Loading } from "./Loading";
import { ProjectAvatar } from "./ProjectAvatar";
import { Styles } from "./Styles";
import { KeyCodes } from "../utilities/KeyCodes";

const openProject = (project: any) => {
    dashboardStore.currentProject = project;
    history.push(Routes.DASHBOARD.PROJECT.replace(":projectId", project.id));
};

const ProjectWrapper = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;

    &:last-child {
        border-bottom-left-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
        border-bottom-right-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.05);
    }
`;

const ProjectInfoWrapper = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 12px;

    .dark-theme & {
        color: #fff;
    }
`;

const KEY_UP = 38;
const KEY_DOWN = 40;

function SearchOverlayResults(props: { loading: boolean; projects: any[]; included?: any[]; onSelected(): void }) {
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const sortedProjects = props.projects.sort((a, b) => {
        return a.attributes.name.toLowerCase() < b.attributes.name.toLowerCase() ? -1 : 1;
    });

    React.useEffect(() => {
        setSelectedIndex(0);
    }, [props.projects]);

    React.useEffect(() => {
        const onKeyDown = (e) => {
            if (props.projects.length === 0) {
                return;
            }

            // arrow up/down button should select next/previous list element
            if (e.keyCode === KEY_UP) {
                if (selectedIndex > 0) {
                    setSelectedIndex(selectedIndex - 1);
                } else {
                    setSelectedIndex(props.projects.length - 1);
                }
            } else if (e.keyCode === KEY_DOWN) {
                if (selectedIndex === props.projects.length - 1) {
                    setSelectedIndex(0);
                } else {
                    setSelectedIndex(selectedIndex + 1);
                }
            } else if (e.keyCode === KeyCodes.ENTER) {
                openProject(sortedProjects[selectedIndex]);
                props.onSelected();
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    });

    if (props.loading) {
        return <Loading />;
    }

    if (props.projects.length === 0) {
        return <Empty description="No projects found" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    return (
        <>
            {sortedProjects.map((project, index) => {
                const ref = React.createRef<HTMLDivElement>();

                const isSelected = selectedIndex === index;

                if (isSelected) {
                    setTimeout(() => {
                        // eslint-disable-next-line no-unused-expressions
                        ref.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "end"
                        });
                    });
                }

                const projectOrganization =
                    props.included &&
                    APIUtils.getIncludedObject(project.relationships.organization.data, props.included);

                return (
                    <ProjectWrapper
                        onClick={() => {
                            if (isSelected) {
                                openProject(project);
                                props.onSelected();
                            } else {
                                setSelectedIndex(index);
                            }
                        }}
                        ref={ref}
                        key={project.id}
                        style={{
                            padding: "8px 16px",
                            background: isSelected ? "var(--color-primary-500)" : undefined
                        }}
                    >
                        <ProjectAvatar
                            project={project}
                            style={{ marginRight: 16, width: 32, height: 32, fontSize: "10px" }}
                        />
                        <ProjectInfoWrapper>
                            {projectOrganization ? `${projectOrganization.attributes.name} / ` : ""}
                            <span style={{ fontWeight: props.included ? "bold" : undefined }}>
                                {project.attributes.name}
                            </span>
                        </ProjectInfoWrapper>
                    </ProjectWrapper>
                );
            })}
        </>
    );
}

export { SearchOverlayResults };
