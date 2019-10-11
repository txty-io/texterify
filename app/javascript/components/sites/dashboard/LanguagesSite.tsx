import { Button, Empty, Icon, Input, Layout, Modal, Table } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { AddEditLanguageForm } from "../../forms/AddEditLanguageForm";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import FlagIcon from "../../ui/FlagIcons";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import { sortStrings } from "../../utilities/Sorter";

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  languages: any[];
  selectedRowLanguages: any[];
  isDeleting: boolean;
  deleteDialogVisible: boolean;
  languagesResponse: any;
  addDialogVisible: boolean;
  perPage: number;
  page: number;
  search: string;
  languagesLoading: boolean;
  languageToEdit: any;
}

class LanguagesSite extends React.Component<IProps, IState> {
  debouncedSearchReloader: any = _.debounce(async (value) => {
    this.setState({ search: value, page: 0 });
    await this.reloadTable({ search: value, page: 0 });
  }, 500, { trailing: true });

  rowSelection: any = {
    onChange: (selectedRowLanguages, _selectedRows) => {
      this.setState({
        selectedRowLanguages: selectedRowLanguages
      });
    },
    getCheckboxProps: () => {
      return {
        disabled: !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())
      };
    }
  };

  state: IState = {
    languages: [],
    selectedRowLanguages: [],
    isDeleting: false,
    deleteDialogVisible: false,
    addDialogVisible: false,
    languagesResponse: null,
    search: "",
    page: 0,
    perPage: DEFAULT_PAGE_SIZE,
    languagesLoading: false,
    languageToEdit: null
  };

  async componentDidMount() {
    try {
      const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);

      this.setState({
        languagesResponse: responseLanguages,
        languages: responseLanguages.data
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  fetchLanguages = async (options?: any) => {
    this.setState({ languagesLoading: true });
    try {
      const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId, options);
      this.setState({
        languagesResponse: responseLanguages,
        languages: responseLanguages.data
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
    this.setState({ languagesLoading: false });
  }

  reloadTable = async (options?: any) => {
    const fetchOptions = options || {};
    fetchOptions.search = options && options.search || this.state.search;
    fetchOptions.page = options && options.page || this.state.page;
    fetchOptions.perPage = options && options.perPage || this.state.perPage;
    await this.fetchLanguages(fetchOptions);
  }

  getColumns = (): any[] => {
    const columns: any[] = [
      {
        title: "Default",
        dataIndex: "default",
        key: "default",
        width: 40
      },
      {
        title: "Country code",
        dataIndex: "countryCode",
        key: "countryCode",
        width: 200
      },
      {
        title: "Language code",
        dataIndex: "languageCode",
        key: "languageCode",
        width: 200
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        defaultSortOrder: "ascend",
        sorter: (a, b) => {
          return sortStrings(
            a.name,
            b.name,
            true
          );
        }
      }
    ];

    if (PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())) {
      columns.push({
        title: "",
        dataIndex: "controls",
        width: 50
      });
    }

    return columns;
  }

  onEditLanguageClick = (language: any) => {
    this.setState({ addDialogVisible: true, languageToEdit: language });
  }

  getRows = (): any[] => {
    if (!this.state.languages) {
      return [];
    }

    return this.state.languages.map(
      (language: any) => {
        const countryCode = APIUtils.getIncludedObject(
          language.relationships.country_code.data,
          this.state.languagesResponse.included
        );

        const languageCode = APIUtils.getIncludedObject(
          language.relationships.language_code.data,
          this.state.languagesResponse.included
        );

        return {
          default: language.attributes.is_default ? <div style={{ textAlign: "center" }}><Icon type="crown" style={{ color: "#d6ad13", fontSize: 16 }} /></div> : null,
          key: language.attributes.id,
          name: language.attributes.name,
          countryCode: countryCode ?
            (
              <span>
                <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                <span style={{ marginLeft: 8 }}>{countryCode.attributes.code}</span>
              </span>
            ) : "",
          languageCode: languageCode ? languageCode.attributes.code : "",
          controls: (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Icon
                type="edit"
                style={{ cursor: "pointer" }}
                onClick={() => { this.onEditLanguageClick(language); }}
              />
            </div>
          )
        };
      },
      []
    );
  }

  onDeleteLanguages = async () => {
    this.setState({
      isDeleting: true,
      deleteDialogVisible: true
    });
    Modal.confirm({
      title: "Do you really want to delete this language?",
      content: "This cannot be undone and all translations for this language will also be deleted.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      visible: this.state.deleteDialogVisible,
      onOk: async () => {
        const response = await LanguagesAPI.deleteLanguages(this.props.match.params.projectId, this.state.selectedRowLanguages);
        if (response.errors) {
          return;
        }

        await this.reloadTable();

        this.setState({
          isDeleting: false,
          deleteDialogVisible: false,
          selectedRowLanguages: []
        });
      },
      onCancel: () => {
        this.setState({
          isDeleting: false,
          deleteDialogVisible: false
        });
      }
    });
  }

  onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.debouncedSearchReloader(event.target.value);
  }

  render() {
    this.rowSelection.selectedRowKeys = this.state.selectedRowLanguages;

    return (
      <>
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
          <Breadcrumbs breadcrumbName="languages" />
          <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
            <h1>Languages</h1>
            <div style={{ display: "flex" }}>
              <div style={{ flexGrow: 1 }}>
                <Button
                  type="default"
                  style={{ marginRight: 10 }}
                  onClick={() => { this.setState({ addDialogVisible: true }); }}
                  disabled={!PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())}
                >
                  Create language
                </Button>
                <Button
                  type="danger"
                  onClick={this.onDeleteLanguages}
                  disabled={
                    this.state.selectedRowLanguages.length === 0 ||
                    !PermissionUtils.isDeveloperOrHigher(dashboardStore.getCurrentRole())
                  }
                  loading={this.state.isDeleting}
                >
                  Delete selected
                </Button>
              </div>
              <Input.Search
                placeholder="Search languages by name"
                onChange={this.onSearch}
                style={{ maxWidth: "50%" }}
              />
            </div>
            <Table
              rowSelection={this.rowSelection}
              dataSource={this.getRows()}
              columns={this.getColumns()}
              style={{ marginTop: 16 }}
              bordered
              loading={!this.state.languagesResponse}
              size="middle"
              pagination={{
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                showSizeChanger: true,
                pageSize: this.state.perPage,
                total: (this.state.languagesResponse && this.state.languagesResponse.meta.total) || 0,
                onChange: async (page: number, _perPage: number) => {
                  this.setState({ page: page });
                  await this.reloadTable({ page: page });
                },
                onShowSizeChange: async (_current: number, size: number) => {
                  this.setState({ perPage: size });
                  await this.reloadTable({ perPage: size });
                }
              }}
              locale={{ emptyText: <Empty description="No languages found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
          </Layout.Content>
        </Layout>

        <AddEditLanguageForm
          projectId={this.props.match.params.projectId}
          languageToEdit={this.state.languageToEdit}
          visible={this.state.addDialogVisible}
          onCancelRequest={() => {
            this.setState({
              addDialogVisible: false,
              languageToEdit: null
            });
          }}
          onCreated={async () => {
            this.setState({
              addDialogVisible: false,
              languageToEdit: null
            });

            const responseLanguages = await LanguagesAPI.getLanguages(this.props.match.params.projectId);
            this.setState({
              languagesResponse: responseLanguages,
              languages: responseLanguages.data
            });
          }}
        />
      </>
    );
  }
}

export { LanguagesSite };
