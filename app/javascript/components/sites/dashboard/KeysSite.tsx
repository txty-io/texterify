import { CrownOutlined, FilterOutlined, MoreOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Drawer, Input, Layout, Modal, Pagination, PaginationProps, Popover, Switch, Tag, Tooltip } from "antd";
import * as _ from "lodash";
import * as queryString from "query-string";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { ExportConfigsAPI, IExportConfig, IGetExportConfigsResponse } from "../../api/v1/ExportConfigsAPI";
import { IGetKeysOptions, IGetKeysResponse, IKey, KeysAPI } from "../../api/v1/KeysAPI";
import { ILanguage, LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectColumnsAPI } from "../../api/v1/ProjectColumnsAPI";
import { ITranslation, TranslationsAPI } from "../../api/v1/TranslationsAPI";
import { EditTranslationFormModal } from "../../forms/EditTranslationFormModal";
import { NewKeyForm } from "../../forms/NewKeyForm";
import { history } from "../../routing/history";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ColumnTag } from "../../ui/ColumnTag";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { IEditableCellFormValues } from "../../ui/EditableCell";
import { EditableTable } from "../../ui/EditableTable";
import { ErrorUtils } from "../../ui/ErrorUtils";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import FlagIcon from "../../ui/FlagIcons";
import { KeyHistory } from "../../ui/KeyHistory";
import { ISearchSettings, KeySearchSettings, parseKeySearchSettingsFromURL } from "../../ui/KeySearchSettings";
import { KeySearchSettingsActiveFilters } from "../../ui/KeySearchSettingsActiveFilters";
import { KeystrokeButtonWrapper } from "../../ui/KeystrokeButtonWrapper";
import { KEYSTROKE_DEFINITIONS } from "../../ui/KeystrokeDefinitions";
import { KeystrokeHandler } from "../../ui/KeystrokeHandler";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import { TranslationUtils } from "../../utilities/TranslationUtils";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    keys: IKey[];
    languages: ILanguage[];
    selectedRowKeys: any[];
    isDeleting: boolean;
    languagesResponse: any;
    keysResponse: IGetKeysResponse;
    exportConfigsResponse: IGetExportConfigsResponse;
    addDialogVisible: boolean;
    page: number;
    search: string | undefined;
    keysLoading: boolean;
    languagesLoading: boolean;
    exportConfigsLoading: boolean;
    projectColumnsLoading: boolean;
    projectColumns: any;
    editTranslationCellOpen: boolean;
    editTranslationKeyId: string;
    editTranslationKeyReponse: any;
    editTranslationLanguageId: string;
    editTranslationExportConfigId: string;
    editTranslationContentChanged: boolean;
    keyToShowHistory: any;
    keyMenuVisible: string;
    searchSettings: ISearchSettings;
    pluralizationEnabledUpdating: boolean;
    htmlEnabledUpdating: boolean;
}

export interface IKeysTableExpandedRecord {
    keysResponse: IGetKeysResponse;
    keyObject: IKey;
    keyId: string;
    key: string; // react key and not a translation key
    translations: { [key: string]: ITranslation };
    languages: ILanguage[];
    exportConfigId: string | null;
    exportConfigName: string | null;
}

export type IKeysTableRecord = IKeysTableExpandedRecord & {
    name?: string;
    description?: string;
    nameEditable?: boolean;
    tags?: JSX.Element[];
    exportConfigOverwrites?: JSX.Element[];
    more?: JSX.Element;
};

class KeysSite extends React.Component<IProps, IState> {
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
            this.setState({ search: value, page: 1 }, this.reloadTable);
        },
        500,
        { trailing: true }
    );

    rowSelection: any = {
        onChange: (selectedRowKeys, _selectedRows) => {
            this.setState({
                selectedRowKeys: selectedRowKeys
            });
        },
        getCheckboxProps: () => {
            return {
                disabled: !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())
            };
        }
    };

    searchInput = React.createRef<Input>();

    constructor(props) {
        super(props);

        const currentQueryParams = queryString.parse(history.location.search);

        this.state = {
            keys: [],
            languages: [],
            selectedRowKeys: [],
            isDeleting: false,
            languagesResponse: null,
            keysResponse: null,
            exportConfigsResponse: null,
            addDialogVisible: false,
            page: 1,
            search: currentQueryParams.q as string,
            keysLoading: true,
            languagesLoading: true,
            exportConfigsLoading: true,
            projectColumnsLoading: true,
            projectColumns: null,
            editTranslationCellOpen: false,
            editTranslationKeyId: "",
            editTranslationKeyReponse: null,
            editTranslationLanguageId: "",
            editTranslationExportConfigId: null,
            editTranslationContentChanged: false,
            keyToShowHistory: null,
            keyMenuVisible: null,
            searchSettings: parseKeySearchSettingsFromURL(),
            pluralizationEnabledUpdating: false,
            htmlEnabledUpdating: false
        };
    }

    async componentDidMount() {
        await this.reloadTable();

        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, {
                showAll: true
            });
            const exportConfigsResponse = await ExportConfigsAPI.getExportConfigs({
                projectId: this.props.match.params.projectId
            });
            const projectColumns = await ProjectColumnsAPI.getProjectColumns({
                projectId: this.props.match.params.projectId
            });
            this.setState({
                languages: responseLanguages.data,
                languagesResponse: responseLanguages,
                languagesLoading: false,
                projectColumns: projectColumns,
                projectColumnsLoading: false,
                exportConfigsResponse: exportConfigsResponse,
                exportConfigsLoading: false
            });
        } catch (error) {
            console.error(error);
        }

        // On resize redraw the table so the width of the columns get recalculated.
        window.addEventListener("resize", () => {
            this.setState(this.state);
        });
    }

    fetchKeys = async (options?: IGetKeysOptions) => {
        this.setState({ keysLoading: true });
        try {
            const responseKeys = await KeysAPI.getKeys(this.props.match.params.projectId, options);
            this.setState({
                keys: responseKeys.data,
                keysResponse: responseKeys
            });
        } catch (error) {
            console.error(error);
        }
        this.setState({ keysLoading: false });
    };

    onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchReloader(event.target.value);
    };

    handleRowSave = async (data: { record: IKeysTableRecord; values: IEditableCellFormValues }) => {
        const hasNameChanged =
            data.values.name !== undefined && data.values.name !== data.record.keyObject.attributes.name;
        const hasDescriptionChanged =
            data.values.description !== undefined &&
            data.values.description !== data.record.keyObject.attributes.description;

        if (hasNameChanged || hasDescriptionChanged) {
            const response = await KeysAPI.update({
                projectId: this.props.match.params.projectId,
                keyId: data.record.keyObject.id,
                name: hasNameChanged ? data.values.name : data.record.keyObject.attributes.name,
                description: hasDescriptionChanged
                    ? data.values.description
                    : data.record.keyObject.attributes.description,
                htmlEnabled: data.record.keyObject.attributes.html_enabled,
                pluralizationEnabled: data.record.keyObject.attributes.pluralization_enabled
            });

            if (response.errors) {
                ErrorUtils.showErrors(response.errors);
            }

            await this.reloadTable();
        } else {
            const keys = Object.keys(data.values);

            for (const key of keys) {
                if (key.startsWith("language-")) {
                    const languageId = key.slice("language-".length);
                    const content = data.values[`language-${languageId}`];

                    if (content !== undefined) {
                        const response = await TranslationsAPI.createTranslation({
                            projectId: this.props.match.params.projectId,
                            languageId: languageId,
                            keyId: data.record.keyObject.id,
                            content: content,
                            exportConfigId: data.record.exportConfigId
                        });

                        if (response.errors) {
                            ErrorUtils.showErrors(response.errors);

                            return;
                        }
                    }
                }
            }

            await this.reloadTable();
        }
    };

    getColumns = () => {
        const filteredLanguages = (this.state.languages || []).filter((language) => {
            return _.find(this.state.projectColumns.included, (o) => {
                return o.attributes.id === language.attributes.id;
            });
        });

        const columns = [];

        if (this.state.projectColumns) {
            if (this.isTagsColumnVisible()) {
                columns.push({
                    title: "Tags",
                    dataIndex: "tags",
                    key: "tags",
                    width: 80
                });
            }

            if (this.isOverwritesColumnVisible()) {
                columns.push({
                    title: (
                        <div style={{ whiteSpace: "nowrap" }}>
                            <span style={{ marginRight: 8 }}>Overwrites</span>
                            <Tooltip title="For which export targets at least one of the translations is overwritten.">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </div>
                    ),
                    dataIndex: "exportConfigOverwrites",
                    key: "exportConfigOverwrites",
                    width: 80
                });
            }

            if (this.isNameColumnVisible()) {
                columns.push({
                    title: "Name",
                    dataIndex: "name",
                    key: "name",
                    editable: true,
                    // defaultSortOrder: "ascend",
                    // sorter: (a, b) => {
                    //     return sortStrings(a.name, b.name, true);
                    // },
                    width: filteredLanguages.length > 0 || this.isDescriptionColumnVisible() ? 400 : undefined
                });
            }

            if (this.isDescriptionColumnVisible()) {
                columns.push({
                    title: "Description",
                    dataIndex: "description",
                    key: "description",
                    editable: true
                    // sorter: (a, b) => {
                    //     return sortStrings(a.description, b.description, true);
                    // }
                });
            }
        }

        const languageColumns = filteredLanguages.map((language) => {
            const countryCode = APIUtils.getIncludedObject(
                language.relationships.country_code.data,
                this.state.languagesResponse.included
            );

            return {
                title: (
                    <div data-language-column={language.id} style={{ minWidth: 160 }}>
                        {language.attributes.is_default && (
                            <Tooltip title="Default language">
                                <CrownOutlined style={{ color: "#d6ad13", fontSize: 16, marginRight: 8 }} />
                            </Tooltip>
                        )}
                        {countryCode ? (
                            <span style={{ marginRight: 8 }}>
                                <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                            </span>
                        ) : (
                            ""
                        )}
                        {language.attributes.name}
                    </div>
                ),
                dataIndex: `language-${language.id}`,
                key: `language-${language.id}`,
                languageId: language.id,
                editable: true
            };
        }, []);

        return [
            ...columns,
            ...languageColumns,
            {
                title: <span data-more-column />,
                dataIndex: "more",
                key: "more",
                width: 72
            }
        ];
    };

    getRows = (): IKeysTableRecord[] => {
        if (!this.state.keys) {
            return [];
        }

        return this.state.keys.map((key) => {
            const translations = {};

            key.relationships.translations.data.map((translationReference) => {
                const translation: ITranslation = APIUtils.getIncludedObject(
                    translationReference,
                    this.state.keysResponse.included
                );

                const exportConfigId = translation.relationships.export_config.data?.id || null;
                const languageId = translation.relationships.language.data.id;

                translations[languageId] = translations[languageId] || {};
                translations[languageId][exportConfigId] = translation;
            });

            const overwrites = this.getKeyExportConfigOverwrites(key);

            const tags = [];

            if (key.attributes.html_enabled) {
                tags.push(
                    <Tag
                        key={`${key.attributes.id}-html_enabled`}
                        color="magenta"
                        style={{ margin: 0, marginRight: 4, marginBottom: 4 }}
                    >
                        HTML
                    </Tag>
                );
            }

            if (key.attributes.pluralization_enabled) {
                tags.push(
                    <Tag
                        key={`${key.attributes.id}-plural`}
                        color="geekblue"
                        style={{
                            margin: 0,
                            marginRight: 4,
                            marginBottom: 4
                        }}
                    >
                        Plural
                    </Tag>
                );
            }

            if (key.relationships.wordpress_contents.data.length > 0) {
                tags.push(
                    <Tag key={`${key.attributes.id}-wordpress`} color="magenta" style={{ margin: 0 }}>
                        WordPress
                    </Tag>
                );
            }

            return {
                tags: [
                    ...key.relationships.tags.data.map((tag) => {
                        const included = APIUtils.getIncludedObject(tag, this.state.keysResponse.included);

                        return (
                            <Tag
                                key={`${key.attributes.id}-${tag.id}`}
                                color="magenta"
                                style={{ margin: 0, marginRight: 4, marginBottom: 4 }}
                            >
                                {included.attributes.name}
                            </Tag>
                        );
                    }),
                    ...tags
                ],
                exportConfigOverwrites: overwrites.map((overwrite) => {
                    return (
                        <Tag
                            key={`${key.attributes.id}-${overwrite.id}`}
                            color="cyan"
                            style={{ margin: "0 4px 4px 0" }}
                        >
                            {overwrite}
                        </Tag>
                    );
                }),
                exportConfigId: null,
                exportConfigName: null,
                keyObject: key,
                keysResponse: this.state.keysResponse,
                keyId: key.attributes.id,
                key: key.attributes.id,
                name: key.attributes.name,
                description: key.attributes.description,
                translations: translations,
                nameEditable: key.attributes.name_editable,
                languages: this.state.languages,
                more: (
                    <Popover
                        placement="topRight"
                        title="Key settings"
                        visible={this.state.keyMenuVisible === key.attributes.id}
                        onVisibleChange={(visible) => {
                            this.setState({ keyMenuVisible: visible ? key.attributes.id : null });
                        }}
                        overlayClassName="popover-no-padding"
                        content={
                            <>
                                <div style={{ padding: "8px 16px", display: "flex", alignItems: "center" }}>
                                    <div style={{ flexGrow: 1 }}>HTML</div>
                                    {!dashboardStore.featureEnabled("FEATURE_HTML_EDITOR") && (
                                        <div style={{ paddingLeft: 16 }}>
                                            <FeatureNotAvailable
                                                feature="FEATURE_HTML_EDITOR"
                                                style={{ marginBottom: 0 }}
                                            />
                                        </div>
                                    )}
                                    <Switch
                                        style={{ marginLeft: 16 }}
                                        checked={key.attributes.html_enabled}
                                        onChange={async () => {
                                            await this.changeHTMLEnabled(key);
                                            await this.reloadTable();
                                        }}
                                        disabled={
                                            !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole()) ||
                                            !dashboardStore.featureEnabled("FEATURE_HTML_EDITOR")
                                        }
                                        loading={this.state.htmlEnabledUpdating}
                                    />
                                </div>
                                <div style={{ padding: "8px 16px", display: "flex", alignItems: "center" }}>
                                    <div style={{ flexGrow: 1 }}>Enable pluralization</div>
                                    <Switch
                                        style={{ marginLeft: 16 }}
                                        checked={key.attributes.pluralization_enabled}
                                        onChange={async () => {
                                            await this.changePluralizationEnabled(key);
                                            await this.reloadTable();
                                        }}
                                        disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                                        loading={this.state.pluralizationEnabledUpdating}
                                    />
                                </div>
                                <div
                                    role="button"
                                    onClick={() => {
                                        this.setState({ keyToShowHistory: key, keyMenuVisible: null });
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        padding: "8px 16px",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    History
                                </div>
                            </>
                        }
                        trigger="click"
                    >
                        <MoreOutlined style={{ width: 40 }} />
                    </Popover>
                )
            };
        }, []);
    };

    changeHTMLEnabled = async (key: IKey) => {
        this.setState({ htmlEnabledUpdating: true });

        try {
            await KeysAPI.update({
                projectId: this.props.match.params.projectId,
                keyId: key.id,
                name: key.attributes.name,
                description: key.attributes.description,
                htmlEnabled: !key.attributes.html_enabled,
                pluralizationEnabled: key.attributes.pluralization_enabled
            });
        } catch (error) {
            console.error(error);
        }

        this.setState({ htmlEnabledUpdating: false });
    };

    changePluralizationEnabled = async (key: IKey) => {
        this.setState({ pluralizationEnabledUpdating: true });

        try {
            await KeysAPI.update({
                projectId: this.props.match.params.projectId,
                keyId: key.id,
                name: key.attributes.name,
                description: key.attributes.description,
                htmlEnabled: key.attributes.html_enabled,
                pluralizationEnabled: !key.attributes.pluralization_enabled
            });
        } catch (error) {
            console.error(error);
        }

        this.setState({ pluralizationEnabledUpdating: false });
    };

    onDeleteKeys = async () => {
        this.setState({
            isDeleting: true
        });
        Modal.confirm({
            title:
                this.state.selectedRowKeys.length === 1
                    ? "Do you really want to delete this key?"
                    : "Do you really want to delete this keys?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            onOk: async () => {
                await KeysAPI.deleteKeys(this.props.match.params.projectId, this.state.selectedRowKeys);

                await this.reloadTable();

                this.setState({
                    isDeleting: false,
                    selectedRowKeys: []
                });
            },
            onCancel: () => {
                this.setState({
                    isDeleting: false
                });
            }
        });
    };

    reloadTable = async () => {
        const fetchOptions: IGetKeysOptions = {
            search: this.state.search,
            page: this.state.page,
            perPage: dashboardStore.keysPerPage,
            searchSettings: this.state.searchSettings
        };
        await this.fetchKeys(fetchOptions);

        void dashboardStore.reloadCurrentProjectIssuesCount();
    };

    isTagsColumnVisible = () => {
        return this.state.projectColumns.data ? this.state.projectColumns.data.attributes.show_tags : true;
    };

    isOverwritesColumnVisible = () => {
        return this.state.projectColumns.data ? this.state.projectColumns.data.attributes.show_overwrites : true;
    };

    isNameColumnVisible = () => {
        return this.state.projectColumns.data ? this.state.projectColumns.data.attributes.show_name : true;
    };

    isDescriptionColumnVisible = () => {
        return this.state.projectColumns.data ? this.state.projectColumns.data.attributes.show_description : true;
    };

    loadProjectColumns = async () => {
        const projectColumns = await ProjectColumnsAPI.getProjectColumns({
            projectId: this.props.match.params.projectId
        });

        this.setState({ projectColumns: projectColumns || [] });

        // Set the whole state because otherwise the subtable column widths are not calculated correctly.
        setTimeout(() => {
            this.setState(this.state);
        });
    };

    getSelectedLanguageColumnIds = () => {
        return (
            (this.state.projectColumns.data &&
                this.state.projectColumns.data.relationships.languages.data.map((o) => {
                    return o.id;
                })) ||
            []
        );
    };

    renderColumnTags = () => {
        return (
            <>
                <ColumnTag
                    onChange={async () => {
                        await ProjectColumnsAPI.updateProjectColumn({
                            projectId: this.props.match.params.projectId,
                            showTags: !this.isTagsColumnVisible(),
                            languages: this.getSelectedLanguageColumnIds()
                        });

                        await this.loadProjectColumns();
                    }}
                    defaultChecked={this.isTagsColumnVisible()}
                >
                    Tags
                </ColumnTag>
                <ColumnTag
                    onChange={async () => {
                        await ProjectColumnsAPI.updateProjectColumn({
                            projectId: this.props.match.params.projectId,
                            showOverwrites: !this.isOverwritesColumnVisible(),
                            languages: this.getSelectedLanguageColumnIds()
                        });

                        await this.loadProjectColumns();
                    }}
                    defaultChecked={this.isOverwritesColumnVisible()}
                >
                    Overwrites
                </ColumnTag>
                <ColumnTag
                    onChange={async () => {
                        await ProjectColumnsAPI.updateProjectColumn({
                            projectId: this.props.match.params.projectId,
                            showName: !this.isNameColumnVisible(),
                            showDescription: this.isDescriptionColumnVisible(),
                            languages: this.getSelectedLanguageColumnIds()
                        });

                        await this.loadProjectColumns();
                    }}
                    defaultChecked={this.isNameColumnVisible()}
                >
                    Name
                </ColumnTag>
                <ColumnTag
                    onChange={async () => {
                        await ProjectColumnsAPI.updateProjectColumn({
                            projectId: this.props.match.params.projectId,
                            showName: this.isNameColumnVisible(),
                            showDescription: !this.isDescriptionColumnVisible(),
                            languages: this.getSelectedLanguageColumnIds()
                        });

                        await this.loadProjectColumns();
                    }}
                    defaultChecked={this.isDescriptionColumnVisible()}
                >
                    Description
                </ColumnTag>
                {this.state.languages &&
                    this.state.languages.map((language) => {
                        const countryCode = APIUtils.getIncludedObject(
                            language.relationships.country_code.data,
                            this.state.languagesResponse.included
                        );

                        return (
                            <ColumnTag
                                key={language.id}
                                defaultChecked={
                                    !!_.find(
                                        this.state.projectColumns.data &&
                                            this.state.projectColumns.data.relationships.languages.data,
                                        { id: language.id }
                                    )
                                }
                                onChange={async (checked: boolean) => {
                                    const projectColumnLanguageIds = this.getSelectedLanguageColumnIds();

                                    let newLanguages = projectColumnLanguageIds;
                                    if (checked) {
                                        newLanguages.push(language.id);
                                    } else {
                                        newLanguages = newLanguages.filter((o) => {
                                            return o !== language.id;
                                        });
                                    }

                                    await ProjectColumnsAPI.updateProjectColumn({
                                        projectId: this.props.match.params.projectId,
                                        showName: this.isNameColumnVisible(),
                                        showDescription: this.isDescriptionColumnVisible(),
                                        languages: newLanguages
                                    });

                                    await this.loadProjectColumns();
                                    await this.reloadTable();
                                }}
                            >
                                {language.attributes.is_default && (
                                    <Tooltip title="Default language">
                                        <CrownOutlined style={{ color: "#d6ad13", fontSize: 16, marginRight: 1 }} />
                                    </Tooltip>
                                )}
                                {countryCode ? (
                                    <span style={{ marginRight: 8 }}>
                                        <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                    </span>
                                ) : (
                                    ""
                                )}
                                {language.attributes.name}
                            </ColumnTag>
                        );
                    })}
            </>
        );
    };

    getKeyExportConfigOverwrites = (key: IKey) => {
        if (!this.state.exportConfigsResponse?.data) {
            return [];
        }

        const exportConfigs: IExportConfig[] = [];
        this.state.exportConfigsResponse.data.map((exportConfig) => {
            const currentKey = this.state.keys.find((k) => {
                return key.id === k.id;
            });
            currentKey.relationships.translations.data.map((translationReference) => {
                const translation: ITranslation = APIUtils.getIncludedObject(
                    translationReference,
                    this.state.keysResponse.included
                );
                const language = APIUtils.getIncludedObject(
                    translation.relationships.language.data,
                    this.state.keysResponse.included
                );
                if (
                    TranslationUtils.hasContent(translation, language, currentKey.attributes.pluralization_enabled) &&
                    translation.relationships.export_config &&
                    translation.relationships.export_config.data &&
                    translation.relationships.export_config.data.id === exportConfig.id
                ) {
                    const exportConfigIncluded = APIUtils.getIncludedObject(
                        translation.relationships.export_config.data,
                        this.state.exportConfigsResponse.data
                    );

                    if (exportConfigIncluded && !exportConfigs.includes(exportConfigIncluded.attributes.name)) {
                        exportConfigs.push(exportConfigIncluded.attributes.name);
                    }
                }
            });
        });

        return exportConfigs;
    };

    render() {
        this.rowSelection.selectedRowKeys = this.state.selectedRowKeys;

        const paginationOptions: PaginationProps = {
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            showSizeChanger: true,
            current: this.state.page,
            pageSize: dashboardStore.keysPerPage,
            total: this.state.keysResponse?.meta?.total || 0,
            onChange: async (page: number, perPage: number) => {
                const isPageSizeChange = perPage !== dashboardStore.keysPerPage;

                if (isPageSizeChange) {
                    dashboardStore.keysPerPage = perPage;
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    this.setState({ page: 1 }, this.reloadTable);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    this.setState({ page: page }, this.reloadTable);
                }

                window.scrollTo(0, 0);
            },
            hideOnSinglePage: false
        };

        return (
            <>
                <KeystrokeHandler
                    keys={KEYSTROKE_DEFINITIONS.KEYS_SITE_NEW_KEY}
                    onActivated={() => {
                        if (PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())) {
                            this.setState({ addDialogVisible: true });
                        }
                    }}
                />

                <KeystrokeHandler
                    keys={KEYSTROKE_DEFINITIONS.KEYS_SITE_SEARCH}
                    onActivated={() => {
                        this.searchInput.current.focus();
                    }}
                />

                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="keys" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                        <h1>Keys</h1>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <Button
                                    type="default"
                                    style={{ marginRight: 8 }}
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                    disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                                >
                                    Create key <KeystrokeButtonWrapper keys={KEYSTROKE_DEFINITIONS.KEYS_SITE_NEW_KEY} />
                                </Button>
                                <Button
                                    danger
                                    onClick={this.onDeleteKeys}
                                    disabled={
                                        this.state.selectedRowKeys.length === 0 ||
                                        !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())
                                    }
                                    loading={this.state.isDeleting}
                                >
                                    Delete selected
                                </Button>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    marginLeft: 120,
                                    flexGrow: 1,
                                    maxWidth: 800
                                }}
                            >
                                <KeySearchSettingsActiveFilters
                                    languagesResponse={this.state.languagesResponse}
                                    exportConfigsResponse={this.state.exportConfigsResponse}
                                />
                                <Input.Group
                                    compact
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        marginTop: 4
                                    }}
                                >
                                    <Popover
                                        title="Search filters"
                                        placement="bottomLeft"
                                        trigger="click"
                                        content={
                                            <KeySearchSettings
                                                languagesResponse={this.state.languagesResponse}
                                                exportConfigsResponse={this.state.exportConfigsResponse}
                                                onChange={(settings) => {
                                                    this.setState(
                                                        { searchSettings: settings, page: 1 },
                                                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                                        this.reloadTable
                                                    );
                                                }}
                                            />
                                        }
                                    >
                                        <Button>
                                            <FilterOutlined />
                                        </Button>
                                    </Popover>
                                    <Input.Search
                                        ref={this.searchInput}
                                        placeholder="Search your translations"
                                        onChange={this.onSearch}
                                        data-id="project-keys-search"
                                        allowClear
                                        defaultValue={this.state.search}
                                    />
                                </Input.Group>
                            </div>
                        </div>
                        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "flex-end" }}>
                            {this.state.projectColumns && this.renderColumnTags()}

                            <div style={{ marginLeft: "auto", marginTop: 4 }}>
                                <Pagination {...paginationOptions} />
                            </div>
                        </div>
                        <EditableTable
                            rowSelection={this.rowSelection}
                            dataSource={this.getRows()}
                            columns={this.getColumns()}
                            style={{ marginTop: 16, maxWidth: "100%" }}
                            bordered
                            loading={
                                this.state.keysLoading ||
                                this.state.languagesLoading ||
                                this.state.exportConfigsLoading ||
                                this.state.projectColumnsLoading ||
                                dashboardStore.currentProject.attributes.current_user_deactivated
                            }
                            projectId={this.props.match.params.projectId}
                            onCellEdit={async (options: { languageId: string; keyId: string }) => {
                                const keyResponse = await KeysAPI.getKey(
                                    this.props.match.params.projectId,
                                    options.keyId
                                );
                                this.setState({
                                    editTranslationCellOpen: true,
                                    editTranslationKeyId: options.keyId,
                                    editTranslationKeyReponse: keyResponse,
                                    editTranslationLanguageId: options.languageId
                                });
                            }}
                            pagination={paginationOptions}
                            onTranslationUpdated={async () => {
                                await this.reloadTable();
                            }}
                            onKeyUpdated={async () => {
                                await this.reloadTable();
                            }}
                            onSave={this.handleRowSave}
                            expandedRowRender={
                                (this.state.exportConfigsResponse?.data || []).length === 0
                                    ? undefined
                                    : (record: IKeysTableRecord) => {
                                          const dataSource: IKeysTableExpandedRecord[] = [];

                                          this.state.exportConfigsResponse.data.forEach((exportConfig) => {
                                              const translations = {};
                                              const currentKey = this.state.keys.find((key) => {
                                                  return record.keyObject.id === key.id;
                                              });
                                              currentKey.relationships.translations.data.forEach(
                                                  (translationReference) => {
                                                      const translation: ITranslation = APIUtils.getIncludedObject(
                                                          translationReference,
                                                          this.state.keysResponse.included
                                                      );

                                                      const exportConfigId =
                                                          translation.relationships.export_config.data?.id || null;
                                                      const languageId = translation.relationships.language.data.id;

                                                      translations[languageId] = translations[languageId] || {};
                                                      translations[languageId][exportConfigId] = translation;
                                                  }
                                              );

                                              dataSource.push({
                                                  key: `${record.keyObject.id}-${exportConfig.id}`,
                                                  keyId: record.keyObject.id,
                                                  keyObject: record.keyObject,
                                                  exportConfigId: exportConfig.id,
                                                  exportConfigName: exportConfig.attributes.name,
                                                  translations: translations,
                                                  keysResponse: this.state.keysResponse,
                                                  languages: this.state.languages
                                              });
                                          });

                                          const columns = [
                                              {
                                                  title: "Export target",
                                                  dataIndex: "exportConfigName",
                                                  key: "exportConfigName"
                                              }
                                          ]
                                              .concat(
                                                  this.getColumns().filter((column) => {
                                                      return (
                                                          column.key.startsWith("language-") || column.key === "more"
                                                      );
                                                  })
                                              )
                                              .map((column) => {
                                                  if (column.key.startsWith("language-")) {
                                                      return {
                                                          ...column,
                                                          width: document
                                                              .querySelector(
                                                                  `[data-language-column="${column.key.slice(
                                                                      "language-".length
                                                                  )}"]`
                                                              )
                                                              ?.parentElement.getBoundingClientRect().width
                                                      };
                                                  } else if (column.key === "more") {
                                                      return {
                                                          ...column,
                                                          width: document
                                                              .querySelector("[data-more-column]")
                                                              ?.parentElement.getBoundingClientRect().width
                                                      };
                                                  } else {
                                                      return column;
                                                  }
                                              });

                                          // Remove one 1px width from the last column.
                                          // Otherwise the borders do not align.
                                          columns[columns.length - 1].width = columns[columns.length - 1].width - 1;

                                          return (
                                              <EditableTable
                                                  columns={columns}
                                                  dataSource={dataSource}
                                                  pagination={false}
                                                  bordered
                                                  showHeader={false}
                                                  projectId={this.props.match.params.projectId}
                                                  onTranslationUpdated={async () => {
                                                      await this.reloadTable();
                                                  }}
                                                  onKeyUpdated={async () => {
                                                      await this.reloadTable();
                                                  }}
                                                  onCellEdit={async (options) => {
                                                      const keyResponse = await KeysAPI.getKey(
                                                          this.props.match.params.projectId,
                                                          options.keyId
                                                      );

                                                      this.setState({
                                                          editTranslationCellOpen: true,
                                                          editTranslationKeyId: options.keyId,
                                                          editTranslationKeyReponse: keyResponse,
                                                          editTranslationLanguageId: options.languageId,
                                                          editTranslationExportConfigId: options.exportConfigId
                                                      });
                                                  }}
                                                  onSave={this.handleRowSave}
                                              />
                                          );
                                      }
                            }
                        />
                    </Layout.Content>
                </Layout>

                <NewKeyForm
                    visible={this.state.addDialogVisible}
                    projectId={this.props.match.params.projectId}
                    languagesResponse={this.state.languagesResponse}
                    onCancelRequest={() => {
                        this.setState({ addDialogVisible: false });
                    }}
                    onCreated={async () => {
                        this.setState({
                            addDialogVisible: false
                        });

                        await this.reloadTable();
                    }}
                />

                <Drawer
                    title="Key history"
                    placement="right"
                    width={600}
                    closable={false}
                    onClose={() => {
                        this.setState({ keyToShowHistory: null });
                    }}
                    visible={!!this.state.keyToShowHistory}
                    // Destroy so "componentDidMount" gets called and new key history is loaded.
                    destroyOnClose
                >
                    {this.state.keyToShowHistory && (
                        <KeyHistory
                            projectId={this.props.match.params.projectId}
                            keyId={this.state.keyToShowHistory && this.state.keyToShowHistory.attributes.id}
                            keyName={this.state.keyToShowHistory && this.state.keyToShowHistory.attributes.name}
                            onTranslationRestored={async () => {
                                await this.reloadTable();
                            }}
                        />
                    )}
                </Drawer>

                <EditTranslationFormModal
                    visible={this.state.editTranslationCellOpen}
                    formProps={{
                        projectId: this.props.match.params.projectId,
                        languagesResponse: this.state.languagesResponse,
                        keyResponse: this.state.editTranslationKeyReponse,
                        selectedLanguageId: this.state.editTranslationLanguageId,
                        selectedExportConfigId: this.state.editTranslationExportConfigId,
                        onSuccess: async () => {
                            this.setState({
                                editTranslationCellOpen: false,
                                editTranslationContentChanged: false,
                                editTranslationExportConfigId: null
                            });
                            await this.reloadTable();
                        }
                    }}
                    onCancelRequest={() => {
                        this.setState({
                            editTranslationCellOpen: false,
                            editTranslationContentChanged: false,
                            editTranslationExportConfigId: null
                        });
                    }}
                />
            </>
        );
    }
}

export { KeysSite };
