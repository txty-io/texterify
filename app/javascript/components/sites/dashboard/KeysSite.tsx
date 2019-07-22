import { Button, Input, Layout, Modal, Tag } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { KeysAPI } from "../../api/v1/KeysAPI";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { ProjectColumnsAPI } from "../../api/v1/ProjectColumnsAPI";
import { NewKeyForm } from "../../forms/NewKeyForm";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { EditableTable } from "../../ui/EditableTable";
import FlagIcon from "../../ui/FlagIcons";
import { makeCancelable } from "../../utilities/Promise";
import { sortStrings } from "../../utilities/Sorter";
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
  projectId: string;
  selectedRowKeys: any[];
  isDeleting: boolean;
  languagesResponse: any;
  keysResponse: any;
  addDialogVisible: boolean;
  perPage: number;
  page: number;
  search: string | undefined;
  keysLoading: boolean;
  projectColumns: any;
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

  constructor(props: IProps) {
    super(props);

    this.state = {
      keys: [],
      languages: [],
      projectId: props.match.params.projectId,
      selectedRowKeys: [],
      isDeleting: false,
      languagesResponse: null,
      keysResponse: null,
      addDialogVisible: false,
      perPage: DEFAULT_PAGE_SIZE,
      page: 0,
      search: undefined,
      keysLoading: false,
      projectColumns: null
    };
  }

  async componentDidMount(): Promise<void> {
    await this.reloadTable();

    try {
      this.getLanguagesPromise = makeCancelable(LanguagesAPI.getLanguages(this.state.projectId));
      const responseLanguages = await this.getLanguagesPromise.promise;
      const projectColumns = await ProjectColumnsAPI.getProjectColumns({
        projectId: this.state.projectId
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
      this.getKeysPromise = makeCancelable(KeysAPI.getKeys(this.state.projectId, options));
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
              <span style={{ marginRight: 10 }}><FlagIcon code={countryCode.attributes.code.toLowerCase()} /></span> :
              ""}
            {language.attributes.name}
          </span>
        ),
        dataIndex: `language-${language.id}`,
        key: `language-${language.id}`,
        editable: true
      };
    }, []);

    return [...columns, ...languageColumns];
  }

  getRows = (): any[] => {
    if (!this.state.keys) {
      return [];
    }

    return this.state.keys.map(
      (key: any) => {
        const translations = {};

        // Stores for which languages a translation exists.
        const translationExistsFor = {};
        key.relationships.translations.data.map((translationReference) => {
          const translation = APIUtils.getIncludedObject(translationReference, this.state.keysResponse.included);
          const languageId = translation.relationships.language.data.id;
          translations[`language-${languageId}`] = translation.attributes.content;
          translationExistsFor[`translation-exists-for-${languageId}`] = translation.id;
        });

        return {
          key: key.attributes.id,
          name: key.attributes.name,
          description: key.attributes.description,
          ...translations,
          ...translationExistsFor
        };
      },
      []
    );
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
      perPage: this.state.perPage
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
      projectId: this.state.projectId
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
              <span style={{ marginRight: 10 }}><FlagIcon code={countryCode.attributes.code.toLowerCase()} /></span> :
              ""}
            {language.attributes.name}
          </ColumnTag>;
        })}
      </>
    );
  }

  render(): JSX.Element {
    if (!this.state.projectColumns || !this.state.projectColumns.data) {
      return null;
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
              pagination={{
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showSizeChanger: true,
                current: this.state.page,
                pageSize: this.state.perPage,
                total: (this.state.keysResponse && this.state.keysResponse.meta.total) || 0,
                onChange: async (page: number, perPage: number) => {
                  this.setState({ page: page }, this.reloadTable);
                },
                onShowSizeChange: async (current: number, size: number) => {
                  this.setState({ perPage: size }, this.reloadTable);
                }
              }}
            />
          </Content>
        </Layout>

        <NewKeyForm
          visible={this.state.addDialogVisible}
          projectId={this.props.match.params.projectId}
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
      </>
    );
  }
}

export { KeysSite };
