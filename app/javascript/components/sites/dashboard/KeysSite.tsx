import { MoreOutlined } from "@ant-design/icons";
import { Button, Drawer, Input, Layout, Modal, Popover, Switch, Tag } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { ExportConfigsAPI } from "../../api/v1/ExportConfigsAPI";
import { KeysAPI } from "../../api/v1/KeysAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectColumnsAPI } from "../../api/v1/ProjectColumnsAPI";
import { TranslationsAPI } from "../../api/v1/TranslationsAPI";
import { NewKeyForm } from "../../forms/NewKeyForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ColumnTag } from "../../ui/ColumnTag";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { EditableTable } from "../../ui/EditableTable";
import { ErrorUtils } from "../../ui/ErrorUtils";
import { FeatureNotAvailable } from "../../ui/FeatureNotAvailable";
import FlagIcon from "../../ui/FlagIcons";
import { KeyHistory } from "../../ui/KeyHistory";
import { Loading } from "../../ui/Loading";
import { TexterifyModal } from "../../ui/TexterifyModal";
import { Utils } from "../../ui/Utils";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import { TranslationCard } from "./editor/TranslationCard";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    keys: any[];
    languages: any[];
    selectedRowKeys: any[];
    isDeleting: boolean;
    languagesResponse: any;
    keysResponse: any;
    exportConfigsResponse: any;
    addDialogVisible: boolean;
    page: number;
    search: string | undefined;
    keysLoading: boolean;
    projectColumns: any;
    editTranslationCellOpen: boolean;
    editTranslationKeyId: string;
    editTranslationKeyReponse: any;
    editTranslationLanguageId: string;
    editTranslationExportConfigId: string;
    editTranslationContentChanged: boolean;
    keyToShowHistory: any;
    keyMenuVisible: string;
}

class KeysSite extends React.Component<IProps, IState> {
    debouncedSearchReloader: any = _.debounce(
        (value) => {
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

    translationCardRef: any;

    state: IState = {
        keys: [],
        languages: [],
        selectedRowKeys: [],
        isDeleting: false,
        languagesResponse: null,
        keysResponse: null,
        exportConfigsResponse: null,
        addDialogVisible: false,
        page: 1,
        search: undefined,
        keysLoading: false,
        projectColumns: null,
        editTranslationCellOpen: false,
        editTranslationKeyId: "",
        editTranslationKeyReponse: null,
        editTranslationLanguageId: "",
        editTranslationExportConfigId: null,
        editTranslationContentChanged: false,
        keyToShowHistory: null,
        keyMenuVisible: null
    };

    async componentDidMount() {
        await this.reloadTable();

        try {
            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);
            const exportConfigsResponse = await ExportConfigsAPI.getExportConfigs({
                projectId: this.props.match.params.projectId
            });
            const projectColumns = await ProjectColumnsAPI.getProjectColumns({
                projectId: this.props.match.params.projectId
            });
            this.setState({
                languages: responseLanguages.data,
                languagesResponse: responseLanguages,
                projectColumns: projectColumns,
                exportConfigsResponse: exportConfigsResponse
            });
        } catch (error) {
            console.error(error);
        }

        // On resize redraw the table so the width of the columns get recalculated.
        window.addEventListener("resize", () => {
            this.setState(this.state);
        });
    }

    fetchKeys = async (options?: any) => {
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

    getColumns = () => {
        const filteredLanguages = this.state.languages.filter((language) => {
            return _.find(this.state.projectColumns.included, (o) => {
                return o.attributes.id === language.attributes.id;
            });
        });

        const columns = [];

        columns.push({
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            width:
                filteredLanguages.length > 0 || this.isNameColumnVisible() || this.isDescriptionColumnVisible()
                    ? 80
                    : undefined
        });

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

        const languageColumns = filteredLanguages.map((language) => {
            const countryCode = APIUtils.getIncludedObject(
                language.relationships.country_code.data,
                this.state.languagesResponse.included
            );

            return {
                title: (
                    <div data-language-column={language.id} style={{ minWidth: 160 }}>
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

    getRows = (): any[] => {
        if (!this.state.keys) {
            return [];
        }

        return this.state.keys.map((key: any) => {
            const translations = {};

            // Stores for which languages a translation exists.
            const translationExistsFor = {};
            key.relationships.translations.data.map((translationReference) => {
                const translation = APIUtils.getIncludedObject(translationReference, this.state.keysResponse.included);

                if (!translation.relationships.export_config.data) {
                    const languageId = translation.relationships.language.data.id;
                    let translationContent = translation.attributes.content;
                    if (key.attributes.html_enabled) {
                        translationContent = Utils.getHTMLContentPreview(translationContent);
                    }
                    translations[`language-${languageId}`] = translationContent;
                    translationExistsFor[`translation-exists-for-${languageId}`] = translation.id;
                }
            });

            return {
                tags: key.attributes.html_enabled ? (
                    <Tag color="magenta" style={{ margin: 0 }}>
                        HTML
                    </Tag>
                ) : undefined,
                key: key.attributes.id,
                keyId: key.attributes.id,
                name: key.attributes.name,
                description: key.attributes.description,
                htmlEnabled: key.attributes.html_enabled,
                ...translations,
                ...translationExistsFor,
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
                                {!dashboardStore.featureEnabled("FEATURE_HTML_EDITOR") && (
                                    <div style={{ padding: "8px 16px" }}>
                                        <FeatureNotAvailable
                                            feature="FEATURE_HTML_EDITOR"
                                            style={{ marginBottom: 0 }}
                                        />
                                    </div>
                                )}
                                <div style={{ padding: "8px 16px", display: "flex", alignItems: "center" }}>
                                    <div style={{ flexGrow: 1 }}>HTML</div>
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

    changeHTMLEnabled = async (key: any) => {
        await KeysAPI.update(
            this.props.match.params.projectId,
            key.id,
            key.attributes.name,
            key.attributes.description,
            !key.attributes.html_enabled
        );
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
        const fetchOptions = {
            search: this.state.search,
            page: this.state.page,
            perPage: dashboardStore.keysPerPage
        };
        await this.fetchKeys(fetchOptions);
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
                    this.state.languages.map((language, index) => {
                        const countryCode = APIUtils.getIncludedObject(
                            language.relationships.country_code.data,
                            this.state.languagesResponse.included
                        );

                        return (
                            <ColumnTag
                                key={index}
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

    render() {
        if (!this.state.projectColumns) {
            return <Loading />;
        }

        this.rowSelection.selectedRowKeys = this.state.selectedRowKeys;

        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="keys" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                        <h1>Keys</h1>
                        <div style={{ display: "flex" }}>
                            <div style={{ flexGrow: 1 }}>
                                <Button
                                    type="default"
                                    style={{ marginRight: 8 }}
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
                                    }}
                                    disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                                >
                                    Create key
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
                            <Input.Search
                                placeholder="Search keys"
                                onChange={this.onSearch}
                                style={{ maxWidth: "50%" }}
                                data-id="project-keys-search"
                            />
                        </div>
                        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "flex-end" }}>
                            <span style={{ marginRight: 8 }}>Select visible columns:</span>
                            {this.renderColumnTags()}
                        </div>
                        <EditableTable
                            rowSelection={this.rowSelection}
                            dataSource={this.getRows()}
                            columns={this.getColumns()}
                            style={{ marginTop: 16, maxWidth: "100%" }}
                            bordered
                            loading={this.state.keysLoading}
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
                            pagination={{
                                pageSizeOptions: PAGE_SIZE_OPTIONS,
                                showSizeChanger: true,
                                current: this.state.page,
                                pageSize: dashboardStore.keysPerPage,
                                total: this.state.keysResponse?.meta.total || 0,
                                onChange: async (page: number, _perPage: number) => {
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    this.setState({ page: page }, this.reloadTable);
                                },
                                onShowSizeChange: async (_current: number, size: number) => {
                                    dashboardStore.keysPerPage = size;
                                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                    this.setState({ page: 1 }, this.reloadTable);
                                }
                            }}
                            onTranslationUpdated={async () => {
                                await this.reloadTable();
                            }}
                            onKeyUpdated={async () => {
                                await this.reloadTable();
                            }}
                            onSave={async (oldRow, newRow) => {
                                if (oldRow.name !== newRow.name || oldRow.description !== newRow.description) {
                                    const response = await KeysAPI.update(
                                        this.props.match.params.projectId,
                                        newRow.key,
                                        newRow.name,
                                        newRow.description,
                                        newRow.html_enabled
                                    );

                                    await this.reloadTable();

                                    if (response.errors) {
                                        ErrorUtils.showErrors(response.errors);

                                        return;
                                    }
                                } else {
                                    const newItem = {
                                        ...oldRow,
                                        ...newRow
                                    };
                                    const keys = Object.keys(newItem);
                                    let languageKey;
                                    for (const key of keys) {
                                        if (key.startsWith("language-")) {
                                            languageKey = key.slice("language-".length);

                                            const content = newItem[`language-${languageKey}`];

                                            if (content !== undefined) {
                                                const response = await TranslationsAPI.createTranslation({
                                                    projectId: this.props.match.params.projectId,
                                                    languageId: languageKey,
                                                    keyId: newItem.key,
                                                    content: content
                                                });
                                                newItem[`translation-exists-for-${languageKey}`] = response.data.id;

                                                if (response.errors) {
                                                    ErrorUtils.showErrors(response.errors);

                                                    return;
                                                }
                                            }
                                        }
                                    }
                                }

                                await this.reloadTable();
                            }}
                            expandedRowRender={
                                this.state.exportConfigsResponse.data.length === 0
                                    ? undefined
                                    : (record) => {
                                          const data = [];

                                          this.state.exportConfigsResponse.data.map((exportConfig) => {
                                              const translations = {};
                                              const currentKey = this.state.keys.find((key) => {
                                                  return record.key === key.id;
                                              });
                                              currentKey.relationships.translations.data.map((translationReference) => {
                                                  const translation = APIUtils.getIncludedObject(
                                                      translationReference,
                                                      this.state.keysResponse.included
                                                  );
                                                  if (
                                                      translation.relationships.export_config &&
                                                      translation.relationships.export_config.data &&
                                                      translation.relationships.export_config.data.id ===
                                                          exportConfig.id
                                                  ) {
                                                      const languageId = translation.relationships.language.data.id;
                                                      let translationContent = translation.attributes.content;
                                                      if (currentKey.attributes.html_enabled) {
                                                          translationContent = Utils.getHTMLContentPreview(
                                                              translationContent
                                                          );
                                                      }
                                                      translations[`language-${languageId}`] = translationContent;
                                                  }
                                              });

                                              data.push({
                                                  key: `${record.key}-${exportConfig.id}`,
                                                  keyId: record.key,
                                                  htmlEnabled: currentKey.attributes.html_enabled,
                                                  exportConfigName: exportConfig.attributes.name,
                                                  exportConfigId: exportConfig.id,
                                                  ...translations
                                                  //   more: <MoreOutlined style={{ width: 40 }} />
                                              });
                                          });

                                          const columns: any = [
                                              {
                                                  title: "Export Configuration",
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
                                                  dataSource={data}
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
                                                  onSave={async (oldRow, newRow) => {
                                                      const newItem = {
                                                          ...oldRow,
                                                          ...newRow
                                                      };
                                                      const keys = Object.keys(newItem);
                                                      let languageKey;

                                                      for (const key of keys) {
                                                          if (key.startsWith("language-")) {
                                                              languageKey = key.slice("language-".length);

                                                              const content = newItem[`language-${languageKey}`];

                                                              if (content !== undefined) {
                                                                  const response = await TranslationsAPI.createTranslation(
                                                                      {
                                                                          projectId: this.props.match.params.projectId,
                                                                          languageId: languageKey,
                                                                          keyId: newItem.keyId,
                                                                          content: content,
                                                                          exportConfigId: oldRow.exportConfigId
                                                                      }
                                                                  );

                                                                  if (response.errors) {
                                                                      ErrorUtils.showErrors(response.errors);

                                                                      return;
                                                                  }
                                                              }
                                                          }
                                                      }

                                                      await this.reloadTable();
                                                  }}
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

                <TexterifyModal
                    title="Edit content"
                    visible={this.state.editTranslationCellOpen}
                    onCancel={() => {
                        this.setState({ editTranslationCellOpen: false });
                    }}
                    afterClose={() => {
                        this.setState({ editTranslationExportConfigId: "" });
                    }}
                    footer={
                        <div style={{ margin: "6px 0" }}>
                            <Button
                                onClick={() => {
                                    this.setState({
                                        editTranslationCellOpen: false,
                                        editTranslationContentChanged: false
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!this.state.editTranslationContentChanged}
                                type="primary"
                                onClick={async () => {
                                    await this.translationCardRef.saveChanges();
                                    this.setState({
                                        editTranslationCellOpen: false,
                                        editTranslationContentChanged: false
                                    });
                                    await this.reloadTable();
                                }}
                            >
                                Save changes
                            </Button>
                        </div>
                    }
                >
                    <TranslationCard
                        projectId={this.props.match.params.projectId}
                        keyResponse={this.state.editTranslationKeyReponse}
                        languagesResponse={this.state.languagesResponse}
                        defaultSelected={this.state.editTranslationLanguageId}
                        exportConfigId={this.state.editTranslationExportConfigId}
                        hideLanguageSelection
                        hideSaveButton
                        ref={(ref) => {
                            return (this.translationCardRef = ref);
                        }}
                        onChange={(changed: boolean) => {
                            this.setState({ editTranslationContentChanged: changed });
                        }}
                    />
                </TexterifyModal>
            </>
        );
    }
}

export { KeysSite };
