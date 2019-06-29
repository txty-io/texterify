import { Button, Icon, Input, Layout, Modal, Table } from "antd";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { LanguagesAPI } from "../../api/v1/LanguagesAPI";
import { AddEditLanguageForm } from "../../forms/AddEditLanguageForm";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import FlagIcon from "../../ui/FlagIcons";
import { makeCancelable } from "../../utilities/Promise";
import { sortStrings } from "../../utilities/Sorter";
const { Header, Content, Footer, Sider } = Layout;
import * as _ from "lodash";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";

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
  getLanguagesPromise: any = null;
  debouncedSearchReloader: any = _.debounce(async (value) => {
    this.setState({ search: value, page: 0 });
    await this.reloadTable({ search: value, page: 0 });
  }, 500, { trailing: true });

  rowSelection: any = {
    onChange: (selectedRowLanguages, selectedRows) => {
      this.setState({
        selectedRowLanguages: selectedRowLanguages
      });
    }
  };

  constructor(props: IProps) {
    super(props);

    this.state = {
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
  }

  async componentDidMount(): Promise<void> {
    try {
      this.getLanguagesPromise = makeCancelable(LanguagesAPI.getLanguages(this.props.match.params.projectId));

      const responseLanguages = await this.getLanguagesPromise.promise;

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

  componentWillUnmount() {
    if (this.getLanguagesPromise !== null) { this.getLanguagesPromise.cancel(); }
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
    return [
      {
        title: "Flag",
        dataIndex: "code",
        key: "code",
        width: 20,
        align: "center"
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
      },
      {
        title: "",
        dataIndex: "controls",
        width: 50
      }
    ];
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

        return {
          key: language.attributes.id,
          name: language.attributes.name,
          code: countryCode ?
            <FlagIcon code={countryCode.attributes.code.toLowerCase()} /> : "",
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

        const newLanguages = this.state.languages.filter((key) => {
          return this.state.selectedRowLanguages.indexOf(key.id) === -1;
        });

        this.setState({
          isDeleting: false,
          languages: newLanguages,
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

  render(): JSX.Element {
    this.rowSelection.selectedRowKeys = this.state.selectedRowLanguages;

    return (
      <>
        <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
          <Breadcrumbs breadcrumbName="languages" />
          <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
            <h1>Languages</h1>
            <div style={{ display: "flex" }}>
              <div style={{ flexGrow: 1 }}>
                <Button type="default" style={{ marginRight: 10 }} onClick={() => { this.setState({ addDialogVisible: true }); }}>
                  Create language
                </Button>
                <Button
                  type="danger"
                  onClick={this.onDeleteLanguages}
                  disabled={this.state.selectedRowLanguages.length === 0}
                  loading={this.state.isDeleting}
                >
                  Delete selected
                </Button>
              </div>
              <Input.Search
                placeholder="Search languages"
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
                onChange: async (page: number, perPage: number) => {
                  this.setState({ page: page });
                  await this.reloadTable({ page: page });
                },
                onShowSizeChange: async (current: number, size: number) => {
                  this.setState({ perPage: size });
                  await this.reloadTable({ perPage: size });
                }
              }}
            />
          </Content>
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

            this.getLanguagesPromise = makeCancelable(LanguagesAPI.getLanguages(this.props.match.params.projectId));
            const responseLanguages = await this.getLanguagesPromise.promise;
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
