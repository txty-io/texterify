import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { SearchOverlayResults } from "./SearchOverlayResults";
import { generalStore } from "../stores/GeneralStore";
import { Styles } from "./Styles";

interface IProps {
    onClose(): void;
}

interface IState {
    projectsLoading: boolean;
    projectsResponse: any;
    search: string;
}

class SearchOverlay extends React.Component<IProps, IState> {
    containerRef = React.createRef<HTMLDivElement>();
    debouncedSearchReloader = _.debounce(
        async (value) => {
            this.setState({ search: value });
            await this.fetchProjects({ search: value });
        },
        500,
        { trailing: true }
    );

    state: IState = {
        projectsLoading: false,
        projectsResponse: null,
        search: ""
    };

    onOutsideClick = () => {
        this.props.onClose();
    };

    clickHandler = (e) => {
        if (!this.containerRef?.current.contains(e.target)) {
            this.onOutsideClick();
        }
    };

    async componentDidMount() {
        window.addEventListener("mouseup", this.clickHandler);
        await this.fetchProjects();
    }

    componentWillUnmount() {
        window.removeEventListener("mouseup", this.clickHandler);
    }

    fetchProjects = async (options?: any) => {
        try {
            this.setState({ projectsLoading: true });
            const responseProjects = await ProjectsAPI.getProjects(options);

            this.setState({
                projectsResponse: responseProjects,
                projectsLoading: false
            });
        } catch (error) {
            console.error(error);
        }
    };

    onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchReloader(event.target.value);
    };

    render() {
        return (
            <>
                <div
                    style={{
                        position: "fixed",
                        background: "rgba(0, 0, 0, 0.5)",
                        width: "100%",
                        height: "100%",
                        zIndex: 9998
                    }}
                />

                <div
                    className="dark-theme"
                    style={{
                        position: "fixed",
                        top: 80,
                        left: "50%",
                        zIndex: 9999,
                        maxWidth: "100%",
                        width: 600
                    }}
                >
                    <div
                        style={{
                            border: generalStore.theme === "dark" ? "1px solid var(--border-color)" : undefined,
                            position: "relative",
                            background: "var(--background-color)",
                            left: "-50%",
                            borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                            margin: "0 40px",
                            boxShadow: "0 0 12px rgba(0, 0, 0, 0.5)"
                        }}
                        ref={this.containerRef}
                    >
                        <div style={{ padding: 8 }}>
                            <Input
                                prefix={<SearchOutlined style={{ marginRight: 12 }} />}
                                onChange={this.onSearch}
                                style={{ border: 0, boxShadow: "none" }}
                                placeholder="Search projects"
                                autoFocus
                            />
                        </div>
                        {(this.state.search || this.state.projectsResponse?.data.length > 0) && (
                            <div style={{ maxHeight: 400, overflowY: "auto" }}>
                                <SearchOverlayResults
                                    loading={this.state.projectsLoading}
                                    projects={this.state.projectsResponse?.data || []}
                                    included={this.state.projectsResponse?.included}
                                    onSelected={this.props.onClose}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }
}

export { SearchOverlay };
