import { Button, Icon, Input, Layout, Modal, Popover, Switch, Tag } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { KeysAPI } from "../../api/v1/KeysAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectColumnsAPI } from "../../api/v1/ProjectColumnsAPI";
import { NewKeyForm } from "../../forms/NewKeyForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { EditableTable } from "../../ui/EditableTable";
import FlagIcon from "../../ui/FlagIcons";
import { KeyHistory } from "../../ui/KeyHistory";
import { Loading } from "../../ui/Loading";
import { Utils } from "../../ui/Utils";
import { makeCancelable } from "../../utilities/Promise";
import { sortStrings } from "../../utilities/Sorter";
import { TranslationCard } from "./editor/TranslationCard";
const { Content } = Layout;

const { CheckableTag } = Tag;

interface IColumnTagProps {
  defaultChecked?: boolean;
  onChange(checked: boolean): void;
}
interface IColumnTagState {
  checked: boolean;
}

class ColumnTag extends React.Component<IColumnTagProps, IColumnTagState> {
  constructor(props: IColumnTagProps) {
    super(props);

    this.state = {
      checked: this.props.defaultChecked
    };
  }

  handleChange = (checked: boolean) => {
    this.setState({ checked: checked });
    this.props.onChange(checked);
  }

  render() {
    return (
      <div style={{ margin: "2px 0" }}>
        <CheckableTag
          {...this.props}
          checked={this.state.checked}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  keys: any[];
  languages: any[];
  selectedRowKeys: any[];
  isDeleting: boolean;
  languagesResponse: any;
  keysResponse: any;
  addDialogVisible: boolean;
  page: number;
  search: string | undefined;
  keysLoading: boolean;
  projectColumns: any;
  editTranslationCellOpen: boolean;
  editTranslationKeyId: string;
  editTranslationKeyReponse: any;
  editTranslationLanguageId: string;
  editTranslationContentChanged: boolean;
  keyToEdit: any;
  keyToShowHistory: string;
  keyMenuVisible: string;
}

class KeysSite extends React.Component<IProps, IState> {
  getKeysPromise: any = null;
  getLanguagesPromise: any = null;
  debouncedSearchReloader: any = _.debounce((value) => {
    this.setState({ search: value, page: 0 }, this.reloadTable);
  }, 500, { trailing: true });

  rowSelection: any = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRowKeys: selectedRowKeys
      });
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
    addDialogVisible: false,
    page: 0,
    search: undefined,
    keysLoading: false,
    projectColumns: null,
    editTranslationCellOpen: false,
    editTranslationKeyId: "",
    editTranslationKeyReponse: null,
    editTranslationLanguageId: "",
    editTranslationContentChanged: false,
    keyToEdit: null,
    keyToShowHistory: null,
    keyMenuVisible: null
  };

  async componentDidMount(): Promise<void> {
    await this.reloadTable();

    try {
      this.getLanguagesPromise = makeCancelable(LanguagesAPI.getLanguages(this.props.match.params.projectId));
      const responseLanguages = await this.getLanguagesPromise.promise;
      const projectColumns = await ProjectColumnsAPI.getProjectColumns({
        projectId: this.props.match.params.projectId
      });
      this.setState({
        languages: responseLanguages.data,
        languagesResponse: responseLanguages,
        projectColumns: projectColumns
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  componentWillUnmount() {
    if (this.getKeysPromise !== null) { this.getKeysPromise.cancel(); }
    if (this.getLanguagesPromise !== null) { this.getLanguagesPromise.cancel(); }
  }

  fetchKeys = async (options?: any) => {
    this.setState({ keysLoading: true });
    try {
      this.getKeysPromise = makeCancelable(KeysAPI.getKeys(this.props.match.params.projectId, options));
      const responseKeys = await this.getKeysPromise.promise;
      this.setState({
        keys: responseKeys.data,
        keysResponse: responseKeys
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
    this.setState({ keysLoading: false });
  }

  onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.debouncedSearchReloader(event.target.value);
  }

  getColumns = (): any[] => {
    const columns = [];

    columns.push({
      title: "Tags",
      dataIndex: "tags",
      key: "tags"
    });

    if (this.isNameColumnVisible()) {
      columns.push({
        title: "Name",
        dataIndex: "name",
        key: "name",
        editable: true,
        // render: (value) => {
        //   return <span style={{ fontFamily: "'Source Code Pro', monospace", display: "flex" }}>{value}</span>;
        // },
        defaultSortOrder: "ascend",
        sorter: (a, b) => {
          return sortStrings(
            a.name,
            b.name,
            true
          );
        }
      });
    }

    if (this.isDescriptionColumnVisible()) {
      columns.push({
        title: "Description",
        dataIndex: "description",
        key: "description",
        editable: true,
        sorter: (a, b) => {
          return sortStrings(
            a.description,
            b.description,
            true
          );
        }
      });
    }

    const filteredLanguages = this.state.languages.filter((language) => _.find(this.state.projectColumns.included, (o) => {
      return o.attributes.id === language.attributes.id;
    }));
    const languageColumns = filteredLanguages.map((language, index) => {
      const countryCode = APIUtils.getIncludedObject(language.relationships.country_code.data, this.state.languagesResponse.included);

      return {
        title: (
          <span>
            {countryCode ?
              <span style={{ marginRight: 8 }}><FlagIcon code={countryCode.attributes.code.toLowerCase()} /></span> :
              ""}
            {language.attributes.name}
          </span>
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
        dataIndex: "more",
        key: "more"
      }
    ];
  }

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
        const languageId = translation.relationships.language.data.id;
        let translationContent = translation.attributes.content;
        if (key.attributes.html_enabled) {
          translationContent = Utils.getHTMLContentPreview(translationContent);
        }
        translations[`language-${languageId}`] = translationContent;
        translationExistsFor[`translation-exists-for-${languageId}`] = translation.id;
      });

      return {
        tags: key.attributes.html_enabled ? <Tag color="magenta">HTML enabled</Tag> : undefined,
        key: key.attributes.id,
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
            content={
              <>
                <div style={{ padding: "8px 16px", display: "flex", alignItems: "center" }}>
                  HTML enabled
                  <Switch
                    style={{ marginLeft: 16 }}
                    checked={key.attributes.html_enabled}
                    onChange={async () => {
                      await this.changeHTMLEnabled(key);
                      await this.reloadTable();
                    }}
                  />
                </div>
                <div
                  role="button"
                  onClick={() => {
                    this.setState({ keyToShowHistory: key.attributes.id, keyMenuVisible: null });
                  }}
                  style={{ padding: "0 16px", borderTop: "1px solid #fcfcfc", display: "flex", alignItems: "center" }}
                >
                  History
                </div>
              </>
            }
            trigger="click"
          >
            <Icon type="more" />
          </Popover>
        )
      };
    }, []);
  }

  changeHTMLEnabled = async (key: any) => {
    await KeysAPI.update(
      this.props.match.params.projectId,
      key.id,
      key.attributes.name,
      key.attributes.description,
      !key.attributes.html_enabled
    );
  }

  openKeyEditDialog = (key: any) => {
    this.setState({
      addDialogVisible: true,
      keyToEdit: key
    });
  }

  onDeleteKeys = async () => {
    this.setState({
      isDeleting: true
    });
    Modal.confirm({
      title: this.state.selectedRowKeys.length === 1 ? "Do you really want to delete this key?" : "Do you really want to delete this keys?",
      content: "This cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        const response = await KeysAPI.deleteKeys(this.props.match.params.projectId, this.state.selectedRowKeys);

        const newKeys = this.state.keys.filter((key) => {
          return this.state.selectedRowKeys.indexOf(key.id) === -1;
        });

        this.setState({
          isDeleting: false,
          keys: newKeys,
          selectedRowKeys: []
        });
      },
      onCancel: () => {
        this.setState({
          isDeleting: false
        });
      }
    });
  }

  reloadTable = async () => {
    const fetchOptions = {
      search: this.state.search,
      page: this.state.page,
      perPage: dashboardStore.keysPerPage
    };
    await this.fetchKeys(fetchOptions);
  }

  isNameColumnVisible = () => {
    return this.state.projectColumns.data.attributes.show_name;
  }

  isDescriptionColumnVisible = () => {
    return this.state.projectColumns.data.attributes.show_description;
  }

  loadProjectColumns = async () => {
    const projectColumns = await ProjectColumnsAPI.getProjectColumns({
      projectId: this.props.match.params.projectId
    });

    this.setState({ projectColumns: projectColumns || [] });
  }

  getSelectedLanguageColumnIds = () => {
    return this.state.projectColumns.data.relationships.languages.data.map((o) => {
      return o.id;
    });
  }

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
        {this.state.languages.map((language, index) => {
          const countryCode = APIUtils.getIncludedObject(language.relationships.country_code.data, this.state.languagesResponse.included);

          return <ColumnTag
            key={index}
            defaultChecked={!!_.find(this.state.projectColumns.data.relationships.languages.data, { id: language.id })}
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
            {countryCode ?
              <span style={{ marginRight: 8 }}><FlagIcon code={countryCode.attributes.code.toLowerCase()} /></span> :
              ""}
            {language.attributes.name}
          </ColumnTag>;
        })}
      </>
    );
  }

  // tslint:disable-next-line:max-func-body-length
  render(): JSX.Element {
    if (!this.state.projectColumns || !this.state.projectColumns.data) {
      return <Loading />;
    }

    this.rowSelection.selectedRowKeys = this.state.selectedRowKeys;

    return (
      <>
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
          <Breadcrumbs breadcrumbName="keys" />
          <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
            <h1>Keys</h1>
            <div style={{ display: "flex" }}>
              <div style={{ flexGrow: 1 }}>
                <Button type="default" style={{ marginRight: 8 }} onClick={() => { this.setState({ addDialogVisible: true }); }}>
                  Create key
                </Button>
                <Button
                  type="danger"
                  onClick={this.onDeleteKeys}
                  disabled={this.state.selectedRowKeys.length === 0}
                  loading={this.state.isDeleting}
                >
                  Delete selected
                </Button>
              </div>
              <Input.Search
                placeholder="Search keys"
                onChange={this.onSearch}
                style={{ maxWidth: "50%" }}
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
              size="middle"
              projectId={this.props.match.params.projectId}
              onCellEdit={async (options: { languageId: string, keyId: string }) => {
                const keyResponse = await KeysAPI.getKey(this.props.match.params.projectId, options.keyId);
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
                total: (this.state.keysResponse && this.state.keysResponse.meta.total) || 0,
                onChange: async (page: number, perPage: number) => {
                  this.setState({ page: page }, this.reloadTable);
                },
                onShowSizeChange: async (current: number, size: number) => {
                  dashboardStore.keysPerPage = size;
                  await this.reloadTable();
                }
              }}
            />
          </Content>
        </Layout>

        <NewKeyForm
          keyToEdit={this.state.keyToEdit}
          visible={this.state.addDialogVisible}
          projectId={this.props.match.params.projectId}
          onCancelRequest={() => {
            this.setState({ addDialogVisible: false, keyToEdit: null });
          }}
          onCreated={async () => {
            this.setState({
              addDialogVisible: false
            });

            await this.reloadTable();
          }}
        />

        <Modal
          maskClosable={false}
          title={"Key history"}
          visible={!!this.state.keyToShowHistory}
          onCancel={() => {
            this.setState({ keyToShowHistory: null });
          }}
          destroyOnClose
        >
          <KeyHistory projectId={this.props.match.params.projectId} keyId={this.state.keyToShowHistory} />
        </Modal>

        <Modal
          maskClosable={false}
          title={"Edit content"}
          visible={this.state.editTranslationCellOpen}
          onCancel={() => {
            this.setState({ editTranslationCellOpen: false });
          }}
          destroyOnClose
          footer={
            <div style={{ margin: "6px 0" }}>
              <Button
                onClick={() => {
                  this.setState({ editTranslationCellOpen: false, editTranslationContentChanged: false });
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!this.state.editTranslationContentChanged}
                type="primary"
                onClick={async () => {
                  await this.translationCardRef.saveChanges();
                  this.setState({ editTranslationCellOpen: false, editTranslationContentChanged: false });
                  await this.reloadTable();
                }}
              >
                Save changes
              </Button>
            </div>}
        >
          <TranslationCard
            projectId={this.props.match.params.projectId}
            keyResponse={this.state.editTranslationKeyReponse}
            languagesResponse={this.state.languagesResponse}
            defaultSelected={this.state.editTranslationLanguageId}
            hideLanguageSelection
            hideSaveButton
            ref={(ref) => this.translationCardRef = ref}
            onChange={(changed: boolean) => {
              this.setState({ editTranslationContentChanged: changed });
            }}
          />
        </Modal>
      </>
    );
  }
}

export { KeysSite };
