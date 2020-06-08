import { ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { Pagination, Tabs, Layout } from "antd";
import Search from "antd/lib/input/Search";
import * as _ from "lodash";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import styled from "styled-components";
import { KeysAPI } from "../../api/v1/KeysAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { dashboardStore } from "../../stores/DashboardStore";
import { KeyHistory } from "../../ui/KeyHistory";
import { Styles } from "../../ui/Styles";
import { UserProfileHeader } from "../../ui/UserProfileHeader";
import { WhiteButton } from "../../ui/WhiteButton";
import { TranslationCard } from "./editor/TranslationCard";
import { DarkModeToggle } from "../../ui/DarkModeToggle";

const Key = styled.div`
    cursor: pointer;
    padding: 12px 16px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;

    &:hover {
        color: #555;
        background: #f0f1ff;
    }

    .dark-theme & {
        color: #fff;

        &:hover {
            background: #1c1c1c;
        }
    }
`;

type IProps = {} & RouteComponentProps<{ projectId: string; keyId?: string }>;
interface IState {
    keysResponse: any;
    keyResponse: any;
    keysLoading: boolean;
    languagesResponse: any;
    selectedLanguageIdFrom: string;
    selectedLanguageIdTo: string;
    search: string;
    page: number;
}

@observer
class EditorSite extends React.Component<IProps, IState> {
    keyHistoryRef: any;

    state: IState = {
        keysResponse: null,
        keyResponse: null,
        keysLoading: true,
        languagesResponse: null,
        selectedLanguageIdFrom: "",
        selectedLanguageIdTo: "",
        search: undefined,
        page: 1
    };

    debouncedSearchReloader: any = _.debounce(
        (value) => {
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.setState({ search: value, page: 1 }, this.fetchKeys);
        },
        500,
        { trailing: true }
    );

    async componentDidMount() {
        window.addEventListener("resize", this.onResize);

        const getProjectResponse = await ProjectsAPI.getProject(this.props.match.params.projectId);
        if (getProjectResponse.errors) {
            this.props.history.push(Routes.DASHBOARD.PROJECTS);
        } else {
            dashboardStore.currentProject = getProjectResponse.data;
            dashboardStore.currentProjectIncluded = getProjectResponse.included;
        }

        await this.fetchKeys();

        const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);

        this.setState({
            languagesResponse: responseLanguages
        });
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }

    fetchKeys = async (options?: any) => {
        options = options || {};
        options.search = options.search || this.state.search;
        options.page = options.page || this.state.page;
        options.perPage = 12;

        this.setState({ keysLoading: true });
        try {
            const responseKeys = await KeysAPI.getKeys(this.props.match.params.projectId, options);
            this.setState({
                keysResponse: responseKeys
            });
        } catch (err) {
            if (!err.isCanceled) {
                console.error(err);
            }
        }
        this.setState({ keysLoading: false });
    };

    onSearch = (event: any) => {
        this.debouncedSearchReloader(event.target.value);
    };

    async componentDidUpdate() {
        if (
            this.props.match.params.keyId &&
            (!this.state.keyResponse || this.state.keyResponse.data.id !== this.props.match.params.keyId)
        ) {
            await this.loadAndSetKey();
        }
    }

    loadAndSetKey = async () => {
        const keyResponse = await KeysAPI.getKey(this.props.match.params.projectId, this.props.match.params.keyId);

        if (keyResponse.data.id === this.props.match.params.keyId) {
            this.setState({
                keyResponse: keyResponse
            });
        }
    };

    keyLoaded = () => {
        return this.state.keyResponse && this.state.keyResponse.data.id === this.props.match.params.keyId;
    };

    isSelectedKey = (keyId: string) => {
        return this.props.match.params.keyId === keyId;
    };

    onResize = () => {
        // Force a rerender to update the calculated fixed height.
        this.forceUpdate();
    };

    render() {
        return (
            <Layout>
                <Layout.Header
                    style={{
                        padding: "0 24px",
                        display: "flex",
                        alignItems: "center",
                        color: "#fff",
                        zIndex: 10,
                        overflow: "hidden"
                    }}
                >
                    <div style={{ flexGrow: 1 }}>
                        <WhiteButton
                            style={{
                                marginRight: 24
                            }}
                            onClick={() => {
                                history.push(
                                    Routes.DASHBOARD.PROJECT.replace(":projectId", this.props.match.params.projectId)
                                );
                            }}
                        >
                            <ArrowLeftOutlined />
                            <span style={{ marginLeft: 16 }}>Back</span>
                        </WhiteButton>
                        {dashboardStore.currentProject && dashboardStore.currentProject.attributes.name}
                    </div>
                    <DarkModeToggle style={{ marginRight: 40 }} />
                    <UserProfileHeader />
                </Layout.Header>
                <Layout>
                    <div style={{ display: "flex", flexGrow: 1, height: window.innerHeight - 64, overflow: "hidden" }}>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                borderRight: "1px solid var(--border-color)",
                                overflow: "auto",
                                flexBasis: 300,
                                flexShrink: 0,
                                flexGrow: 0
                            }}
                        >
                            <Search
                                placeholder="Search keys and translations"
                                onChange={this.onSearch}
                                style={{ margin: 16, width: "auto" }}
                            />
                            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                                {!this.state.keysLoading &&
                                    this.state.keysResponse &&
                                    this.state.keysResponse.data.map((key, index) => {
                                        return (
                                            <Key
                                                key={key.id}
                                                index={index}
                                                onClick={() => {
                                                    history.push(
                                                        Routes.DASHBOARD.PROJECT_EDITOR_KEY.replace(
                                                            ":projectId",
                                                            this.props.match.params.projectId
                                                        ).replace(":keyId", key.id)
                                                    );
                                                }}
                                                style={{
                                                    background: this.isSelectedKey(key.id)
                                                        ? Styles.COLOR_PRIMARY_LIGHT
                                                        : undefined
                                                }}
                                            >
                                                {key.attributes.name}
                                            </Key>
                                        );
                                    })}
                                {this.state.keysLoading && (
                                    <LoadingOutlined style={{ fontSize: 24, margin: "auto" }} spin />
                                )}
                                {!this.state.keysLoading && this.state.keysResponse.data.length === 0 && (
                                    <div
                                        style={{
                                            margin: "auto",
                                            color: Styles.COLOR_TEXT_DISABLED,
                                            fontStyle: "italic"
                                        }}
                                    >
                                        No keys found.
                                    </div>
                                )}
                            </div>
                            <Pagination
                                defaultCurrent={1}
                                total={(this.state.keysResponse && this.state.keysResponse.meta.total) || 0}
                                onChange={async (page: number, _perPage: number) => {
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    this.setState({ page: page }, this.fetchKeys);
                                }}
                                style={{ alignSelf: "center", margin: 16 }}
                                size="small"
                                pageSize={12}
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                flexGrow: 1,
                                padding: 16,
                                overflow: "auto"
                            }}
                        >
                            {this.keyLoaded() && (
                                <div className="fade-in">
                                    <h2 style={{ fontSize: 16, wordBreak: "break-word" }}>
                                        {this.state.keyResponse && this.state.keyResponse.data.attributes.name}
                                    </h2>
                                    <p style={{ wordBreak: "break-word" }}>
                                        {this.state.keyResponse && this.state.keyResponse.data.attributes.description}
                                    </p>

                                    {this.state.languagesResponse && this.state.languagesResponse.data.length > 0 && (
                                        <TranslationCard
                                            projectId={this.props.match.params.projectId}
                                            languagesResponse={this.state.languagesResponse}
                                            defaultSelected={this.state.languagesResponse.data[0].id}
                                            keyResponse={this.state.keyResponse}
                                            onSave={() => {
                                                if (this.keyHistoryRef) {
                                                    this.keyHistoryRef.reload();
                                                }
                                            }}
                                        />
                                    )}

                                    {this.state.languagesResponse && this.state.languagesResponse.data.length >= 2 && (
                                        <TranslationCard
                                            projectId={this.props.match.params.projectId}
                                            languagesResponse={this.state.languagesResponse}
                                            defaultSelected={this.state.languagesResponse.data[1].id}
                                            keyResponse={this.state.keyResponse}
                                            onSave={() => {
                                                if (this.keyHistoryRef) {
                                                    this.keyHistoryRef.reload();
                                                }
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                            {!this.keyLoaded() && !this.props.match.params.keyId && (
                                <p style={{ color: Styles.COLOR_TEXT_DISABLED, fontStyle: "italic", margin: "auto" }}>
                                    Select a key from the left to start editing.
                                </p>
                            )}
                        </div>

                        {this.keyLoaded() && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    borderLeft: "1px solid var(--border-color)",
                                    overflow: "auto",
                                    flexBasis: 300,
                                    flexShrink: 0,
                                    flexGrow: 0
                                }}
                            >
                                <Tabs defaultActiveKey="history" type="card" style={{ overflow: "auto" }}>
                                    {/* <Tabs.TabPane tab="Comments" key="chat" style={{ padding: "0 16px", overflow: "auto" }} >
                                    <KeyComments />
                                    </Tabs.TabPane> */}
                                    <Tabs.TabPane tab="History" key="history" style={{ padding: "0 16px 16px" }}>
                                        {this.props.match.params.projectId && this.state.keyResponse.data.id && (
                                            <KeyHistory
                                                projectId={this.props.match.params.projectId}
                                                keyName={this.state.keyResponse.data.attributes.name}
                                                keyId={this.state.keyResponse.data.id}
                                                onTranslationRestored={async () => {
                                                    await this.loadAndSetKey();
                                                }}
                                                ref={(ref) => {
                                                    this.keyHistoryRef = ref;
                                                }}
                                            />
                                        )}
                                    </Tabs.TabPane>
                                </Tabs>
                            </div>
                        )}
                    </div>
                </Layout>
            </Layout>
        );
    }
}

export { EditorSite };
