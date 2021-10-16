import { ArrowLeftOutlined, HddOutlined, LoadingOutlined, SettingOutlined } from "@ant-design/icons";
import { Alert, Button, Input, Layout, Pagination, Popover, Skeleton, Tabs, Tag } from "antd";
import * as _ from "lodash";
import { observer } from "mobx-react";
import * as queryString from "query-string";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { APIUtils } from "../../api/v1/APIUtils";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { IGetKeysOptions, KeysAPI } from "../../api/v1/KeysAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import {
    IGetMachineTranslationsSourceLanguages,
    IGetMachineTranslationsTargetLanguages,
    MachineTranslationsAPI
} from "../../api/v1/MachineTranslationsAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { MenuLinkWrapper, MenuList } from "../../routing/DashboardRouter";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore } from "../../stores/DashboardStore";
import { DarkModeToggle } from "../../ui/DarkModeToggle";
import { EditorSidebarInfo } from "../../ui/EditorSidebarInfo";
import FlagIcon from "../../ui/FlagIcons";
import { KeyHistory } from "../../ui/KeyHistory";
import { ISearchSettings, KeySearchSettings, parseKeySearchSettingsFromURL } from "../../ui/KeySearchSettings";
import { KeySearchSettingsActiveFilters } from "../../ui/KeySearchSettingsActiveFilters";
import { Styles } from "../../ui/Styles";
import { UserProfileHeader } from "../../ui/UserProfileHeader";
import { DATE_TIME_FORMAT, Utils } from "../../ui/Utils";
import { TranslationCard } from "./editor/TranslationCard";
import * as moment from "moment";

const Key = styled.div<{ isSelected: boolean }>`
    cursor: pointer;
    padding: 12px 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;

    background: ${(props) => {
        return props.isSelected ? "var(--primary-light-color)" : "none";
    }};

    color: ${(props) => {
        return props.isSelected ? "var(--blue-color)" : "#333";
    }};

    &:hover {
        color: var(--blue-color);
    }

    .dark-theme & {
        color: #fff;

        &:hover {
            color: var(--blue-color);
        }
    }
`;

type IProps = RouteComponentProps<{ projectId: string; keyId?: string }>;
interface IState {
    keysResponse: any;
    keyResponse: any;
    keysLoading: boolean;
    languagesResponse: any;
    exportConfigsResponse: any;
    selectedLanguageIdFrom: string;
    selectedLanguageIdTo: string;
    search: string;
    page: number;
    searchSettings: ISearchSettings;
    supportedSourceLanguages: IGetMachineTranslationsSourceLanguages;
    supportedTargetLanguages: IGetMachineTranslationsTargetLanguages;
}

@observer
class EditorSite extends React.Component<IProps, IState> {
    keyHistoryRef: any;

    state: IState = {
        keysResponse: null,
        keyResponse: null,
        keysLoading: true,
        languagesResponse: null,
        exportConfigsResponse: null,
        selectedLanguageIdFrom: "",
        selectedLanguageIdTo: "",
        search: undefined,
        page: 1,
        searchSettings: parseKeySearchSettingsFromURL(),
        supportedSourceLanguages: null,
        supportedTargetLanguages: null
    };

    debouncedSearchReloader = _.debounce(
        (value) => {
            const currentQueryParams = queryString.parse(history.location.search);
            const searchObject: { q?: string } = currentQueryParams;

            if (value) {
                searchObject.q = value;
            } else {
                delete searchObject.q;
            }

            const searchString = queryString.stringify(searchObject);
            history.push({
                search: searchString
            });

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

        const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, { showAll: true });
        const exportConfigsResponse = await ExportConfigsAPI.getExportConfigs({
            projectId: this.props.match.params.projectId
        });

        this.setState({
            languagesResponse: responseLanguages,
            exportConfigsResponse: exportConfigsResponse
        });

        if (dashboardStore.currentProject.attributes.machine_translation_active) {
            const supportedSourceLanguages = await MachineTranslationsAPI.getSourceLanguages();
            const supportedTargetLanguages = await MachineTranslationsAPI.getTargetLanguages();

            this.setState({
                supportedSourceLanguages: supportedSourceLanguages,
                supportedTargetLanguages: supportedTargetLanguages
            });
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize);
    }

    fetchKeys = async (options?: IGetKeysOptions) => {
        options = options || {};
        options.search = options.search || this.state.search;
        options.page = options.page || this.state.page;
        options.perPage = dashboardStore.keysPerPageEditor;
        options.searchSettings = this.state.searchSettings;

        this.setState({ keysLoading: true });
        try {
            const responseKeys = await KeysAPI.getKeys(this.props.match.params.projectId, options);
            this.setState({
                keysResponse: responseKeys
            });
        } catch (err) {
            console.error(err);
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
        let defaultLanguage;
        let defaultLanguageTranslationContent;
        let languagesWithoutDefault = [];
        if (this.state.languagesResponse) {
            defaultLanguage = this.state.languagesResponse.data.find((language) => {
                return language.attributes.is_default;
            });

            languagesWithoutDefault = this.state.languagesResponse.data.filter((language) => {
                return language.id !== defaultLanguage?.id;
            });

            if (this.state.keyResponse && defaultLanguage) {
                const currentKey = this.state.keyResponse.data;

                if (currentKey) {
                    currentKey.relationships.translations.data.some((translationReference) => {
                        const translation = APIUtils.getIncludedObject(
                            translationReference,
                            this.state.keyResponse.included
                        );

                        if (
                            translation &&
                            translation.relationships.export_config.data === null &&
                            translation.relationships.language.data.id === defaultLanguage.id
                        ) {
                            defaultLanguageTranslationContent = translation.attributes.content;

                            return true;
                        }
                    });
                }
            }
        }

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
                    // Apply the dark-theme class because the
                    // main menu bar is always in dark mode.
                    className="dark-theme"
                >
                    <div style={{ flexGrow: 1 }}>
                        <Button
                            type="primary"
                            style={{
                                marginRight: 24
                            }}
                            onClick={() => {
                                history.push(
                                    Routes.DASHBOARD.PROJECT.replace(":projectId", this.props.match.params.projectId)
                                );
                            }}
                            className="editor-back"
                        >
                            <ArrowLeftOutlined />
                            <span style={{ marginLeft: 16 }}>Back</span>
                        </Button>
                        {dashboardStore.currentProject && dashboardStore.currentProject.attributes.name}
                    </div>

                    {authStore.currentUser?.is_superadmin && (
                        <ul
                            className="dashboard-main-menu"
                            style={{
                                overflow: "hidden",
                                marginBottom: 0,
                                marginLeft: 0,
                                marginRight: 24,
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            <MenuList>
                                <MenuLinkWrapper data-id="main-menu-instance-settings">
                                    <Link to={Routes.DASHBOARD.INSTANCE.ROOT}>
                                        <HddOutlined style={{ marginRight: 8 }} />
                                        Admin
                                    </Link>
                                </MenuLinkWrapper>
                            </MenuList>
                        </ul>
                    )}

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
                                width: "25%",
                                flexShrink: 0
                            }}
                        >
                            <div style={{ margin: 24, width: "auto" }}>
                                <KeySearchSettingsActiveFilters
                                    languagesResponse={this.state.languagesResponse}
                                    exportConfigsResponse={this.state.exportConfigsResponse}
                                />
                                {/* <Search placeholder="Search keys and translations" onChange={this.onSearch} /> */}
                                <Input.Group
                                    compact
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        marginTop: 4
                                    }}
                                >
                                    <Popover
                                        title="Search settings"
                                        placement="bottomLeft"
                                        trigger="click"
                                        content={
                                            <KeySearchSettings
                                                languagesResponse={this.state.languagesResponse}
                                                exportConfigsResponse={this.state.exportConfigsResponse}
                                                onChange={(settings) => {
                                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                                    this.setState({ searchSettings: settings }, this.fetchKeys);
                                                }}
                                            />
                                        }
                                    >
                                        <Button>
                                            <SettingOutlined />
                                        </Button>
                                    </Popover>
                                    <Input.Search
                                        placeholder="Search your translations"
                                        onChange={this.onSearch}
                                        data-id="project-keys-search"
                                        allowClear
                                        defaultValue={this.state.search}
                                    />
                                </Input.Group>
                            </div>
                            <div
                                style={{
                                    flexGrow: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    flexShrink: 1,
                                    overflow: "auto"
                                }}
                            >
                                {!this.state.keysLoading &&
                                    this.state.keysResponse &&
                                    this.state.keysResponse.data.map((key, index) => {
                                        let keyContentPreview: JSX.Element;

                                        if (defaultLanguage) {
                                            const countryCode = APIUtils.getIncludedObject(
                                                defaultLanguage.relationships.country_code.data,
                                                this.state.languagesResponse.included
                                            );

                                            const defaultLanguageTranslation = key.relationships.translations.data.find(
                                                (translationReference) => {
                                                    const translation = APIUtils.getIncludedObject(
                                                        translationReference,
                                                        this.state.keysResponse.included
                                                    );

                                                    return (
                                                        translation &&
                                                        translation.relationships.export_config.data === null &&
                                                        translation.relationships.language.data.id ===
                                                            defaultLanguage.id
                                                    );
                                                }
                                            );

                                            if (defaultLanguageTranslation) {
                                                const translation = APIUtils.getIncludedObject(
                                                    defaultLanguageTranslation,
                                                    this.state.keysResponse.included
                                                );

                                                let content = key.attributes.html_enabled
                                                    ? Utils.getHTMLContentPreview(translation.attributes.content)
                                                    : translation.attributes.content;

                                                if (!key.attributes.html_enabled && this.state.keysResponse) {
                                                    let converted = [content];

                                                    this.state.keysResponse.included
                                                        .filter((included) => {
                                                            return included.type === "placeholder";
                                                        })
                                                        .forEach((included) => {
                                                            converted = converted.reduce((acc, element) => {
                                                                if (typeof element === "string") {
                                                                    const splitted = element.split(
                                                                        included.attributes.name
                                                                    );
                                                                    const joined = splitted.reduce(
                                                                        (arr, curr, currIndex) => {
                                                                            if (currIndex > 0) {
                                                                                return arr.concat([
                                                                                    <Tag
                                                                                        color="volcano"
                                                                                        style={{
                                                                                            margin: 0,
                                                                                            padding: "0 0px",
                                                                                            border: 0,
                                                                                            borderRadius: 1
                                                                                        }}
                                                                                        key={`${included.attributes.name}-${currIndex}`}
                                                                                    >
                                                                                        {included.attributes.name}
                                                                                    </Tag>,
                                                                                    curr
                                                                                ]);
                                                                            } else {
                                                                                return arr.concat([curr]);
                                                                            }
                                                                        },
                                                                        []
                                                                    );

                                                                    return acc.concat(joined);
                                                                } else {
                                                                    return acc.concat([element]);
                                                                }
                                                            }, []);
                                                        });

                                                    content = converted;
                                                }

                                                keyContentPreview = (
                                                    <>
                                                        {countryCode && (
                                                            <span style={{ marginRight: 8 }}>
                                                                <FlagIcon
                                                                    code={countryCode.attributes.code.toLowerCase()}
                                                                />
                                                            </span>
                                                        )}
                                                        {translation.attributes.content === "" ? (
                                                            <span style={{ color: "var(--color-passive)" }}>
                                                                No content
                                                            </span>
                                                        ) : (
                                                            content
                                                        )}
                                                    </>
                                                );
                                            } else {
                                                keyContentPreview = (
                                                    <div style={{ color: "var(--color-passive)" }}>
                                                        {countryCode && (
                                                            <span style={{ marginRight: 8 }}>
                                                                <FlagIcon
                                                                    code={countryCode.attributes.code.toLowerCase()}
                                                                />
                                                            </span>
                                                        )}
                                                        No content
                                                    </div>
                                                );
                                            }
                                        } else {
                                            if (this.state.languagesResponse) {
                                                keyContentPreview = (
                                                    <div style={{ color: "var(--color-passive)" }}>
                                                        Set a default language for preview.
                                                    </div>
                                                );
                                            } else {
                                                keyContentPreview = (
                                                    <Skeleton
                                                        active
                                                        paragraph={{ rows: 1 }}
                                                        title={false}
                                                        className="skeleton-small"
                                                    />
                                                );
                                            }
                                        }

                                        return (
                                            <Key
                                                key={key.id}
                                                index={index}
                                                onClick={() => {
                                                    history.push(
                                                        Routes.DASHBOARD.PROJECT_EDITOR_KEY.replace(
                                                            ":projectId",
                                                            this.props.match.params.projectId
                                                        ).replace(":keyId", key.id) + history.location.search
                                                    );
                                                }}
                                                isSelected={this.isSelectedKey(key.id)}
                                                style={{
                                                    color: this.isSelectedKey(key.id) ? "var(--blue-color)" : undefined,
                                                    flexShrink: 0
                                                }}
                                                className="editor-key"
                                            >
                                                <span style={{ fontWeight: "bold" }} className="editor-key-name">
                                                    {key.attributes.name}
                                                </span>
                                                <div
                                                    style={{
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                        marginTop: 8,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between"
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            flexShrink: 1,
                                                            flexGrow: 1,
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis"
                                                        }}
                                                        className="editor-key-content"
                                                    >
                                                        {keyContentPreview}
                                                    </div>
                                                    <div style={{ marginLeft: 8, flexShrink: 0 }}>
                                                        {key.attributes.html_enabled && (
                                                            <Tag
                                                                color="magenta"
                                                                className="editor-key-html"
                                                                style={{ margin: 0, marginRight: 4 }}
                                                            >
                                                                HTML
                                                            </Tag>
                                                        )}
                                                        {key.relationships.wordpress_contents.data.length > 0 && (
                                                            <Tag
                                                                color="magenta"
                                                                className="editor-key-html"
                                                                style={{ margin: 0 }}
                                                            >
                                                                WordPress
                                                            </Tag>
                                                        )}
                                                    </div>
                                                </div>
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
                                size="small"
                                current={this.state.page}
                                total={(this.state.keysResponse && this.state.keysResponse.meta.total) || 0}
                                onChange={async (page: number, _perPage: number) => {
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    this.setState({ page: page }, this.fetchKeys);
                                }}
                                onShowSizeChange={async (_current: number, size: number) => {
                                    dashboardStore.keysPerPageEditor = size;
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    this.setState({ page: 1 }, this.fetchKeys);
                                }}
                                style={{ alignSelf: "center", margin: 16 }}
                                pageSize={dashboardStore.keysPerPageEditor}
                                showSizeChanger
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
                            {this.keyLoaded() && this.state.languagesResponse && (
                                <div className="fade-in">
                                    <h2 style={{ fontSize: 16, wordBreak: "break-word" }}>
                                        {this.state.keyResponse && this.state.keyResponse.data.attributes.name}
                                    </h2>
                                    <p style={{ wordBreak: "break-word" }}>
                                        {this.state.keyResponse && this.state.keyResponse.data.attributes.description}
                                    </p>

                                    {this.state.languagesResponse && this.state.languagesResponse.data.length === 0 && (
                                        <Alert
                                            type="info"
                                            showIcon
                                            message="No language"
                                            description={
                                                <p>
                                                    <Link
                                                        to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                            ":projectId",
                                                            this.props.match.params.projectId
                                                        )}
                                                    >
                                                        Create a language
                                                    </Link>{" "}
                                                    before you can translate your content.
                                                </p>
                                            }
                                            style={{ marginBottom: 24 }}
                                        />
                                    )}

                                    {defaultLanguage ? (
                                        <TranslationCard
                                            projectId={this.props.match.params.projectId}
                                            languagesResponse={this.state.languagesResponse}
                                            languages={[defaultLanguage]}
                                            defaultSelected={defaultLanguage.id}
                                            keyResponse={this.state.keyResponse}
                                            isDefaultLanguage
                                            onSave={async () => {
                                                if (this.keyHistoryRef) {
                                                    this.keyHistoryRef.reload();
                                                }

                                                await this.loadAndSetKey();
                                            }}
                                        />
                                    ) : (
                                        <Alert
                                            showIcon
                                            message={
                                                <>
                                                    Set a default language as source for translation by clicking{" "}
                                                    <Link
                                                        to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                            ":projectId",
                                                            this.props.match.params.projectId
                                                        )}
                                                    >
                                                        here
                                                    </Link>
                                                    .
                                                </>
                                            }
                                            type="info"
                                            style={{
                                                marginBottom: 24
                                            }}
                                        />
                                    )}

                                    {languagesWithoutDefault.length > 0 ? (
                                        <TranslationCard
                                            projectId={this.props.match.params.projectId}
                                            languagesResponse={this.state.languagesResponse}
                                            languages={languagesWithoutDefault}
                                            defaultSelected={languagesWithoutDefault[0].id}
                                            keyResponse={this.state.keyResponse}
                                            defaultLanguage={defaultLanguage}
                                            defaultLanguageTranslationContent={defaultLanguageTranslationContent}
                                            supportedSourceLanguages={this.state.supportedSourceLanguages}
                                            supportedTargetLanguages={this.state.supportedTargetLanguages}
                                            onSave={() => {
                                                if (this.keyHistoryRef) {
                                                    this.keyHistoryRef.reload();
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Alert
                                            showIcon
                                            message={
                                                <>
                                                    Add more languages to translate by clicking{" "}
                                                    <Link
                                                        to={Routes.DASHBOARD.PROJECT_LANGUAGES.replace(
                                                            ":projectId",
                                                            this.props.match.params.projectId
                                                        )}
                                                    >
                                                        here
                                                    </Link>
                                                    .
                                                </>
                                            }
                                            type="info"
                                            style={{ marginTop: 24 }}
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
                                    width: "25%",
                                    flexShrink: 0
                                }}
                            >
                                <Tabs defaultActiveKey="info" type="card" style={{ overflow: "auto" }}>
                                    <Tabs.TabPane tab="Info" key="info" style={{ padding: "0 16px", overflow: "auto" }}>
                                        {/* <KeyComments /> */}
                                        <h3>General</h3>
                                        <EditorSidebarInfo
                                            name="Created at"
                                            value={moment(this.state.keyResponse.data.attributes.created_at).format(
                                                DATE_TIME_FORMAT
                                            )}
                                        />
                                        <EditorSidebarInfo
                                            name="Updated at"
                                            value={moment(this.state.keyResponse.data.attributes.updated_at).format(
                                                DATE_TIME_FORMAT
                                            )}
                                        />

                                        <h3 style={{ marginTop: 24 }}>Placeholders</h3>
                                        <p>Placeholders used in the default language.</p>
                                        {this.state.keyResponse.included
                                            .filter((included) => {
                                                return included.type === "placeholder";
                                            })
                                            .map((included, index) => {
                                                return (
                                                    <Tag color="volcano" key={index}>
                                                        {included.attributes.name}
                                                    </Tag>
                                                );
                                            })}
                                    </Tabs.TabPane>
                                    {/* <Tabs.TabPane tab="Comments" key="chat" style={{ padding: "0 16px", overflow: "auto" }} >
                                    <KeyComments />
                                    </Tabs.TabPane> */}
                                    <Tabs.TabPane tab="History" key="history" style={{ padding: "0 24px 24px" }}>
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
