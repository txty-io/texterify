import { Button, Empty, message, Modal, Popconfirm, Table } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import {
    ForbiddenWordsListsAPI,
    IForbiddenWordsList,
    IGetForbiddenWordsListsOptions,
    IGetForbiddenWordsListsResponse
} from "../api/v1/ForbiddenWordsListsAPI";
import { IGetLanguagesResponse, LanguagesAPI } from "../api/v1/LanguagesAPI";
import { AddEditForbiddenWordsListForm } from "../forms/AddEditForbiddenWordListForm";
import { PAGE_SIZE_OPTIONS } from "./Config";
import { DATA_IDS } from "./DataIds";
import { DeleteLink } from "./DeleteLink";
import { ErrorUtils } from "./ErrorUtils";
import { LanguageNameWithFlag } from "./LanguageNameWithFlag";
import { Styles } from "./Styles";

interface IProps {
    projectId: string;
}

interface IState {
    addForbiddenWordListDialogVisible: boolean;
    languagesResponse: IGetLanguagesResponse;
    forbiddenWordsListToEdit: IForbiddenWordsList;
    forbiddenWordsListsResponse: IGetForbiddenWordsListsResponse;
    forbiddenWordsListsUpdating: boolean;
    forbiddenWordsListsLoading: boolean;
    page: number;
    perPage: number;
    isDeleting: boolean;
    isUpdating: boolean;
}

@observer
class ForbiddenWordsListsTable extends React.Component<IProps, IState> {
    state: IState = {
        addForbiddenWordListDialogVisible: false,
        languagesResponse: null,
        forbiddenWordsListToEdit: null,
        forbiddenWordsListsResponse: null,
        forbiddenWordsListsUpdating: false,
        forbiddenWordsListsLoading: true,
        page: 1,
        perPage: 10,
        isDeleting: false,
        isUpdating: false
    };

    async componentDidMount() {
        await this.reloadTable();

        try {
            const languagesResponse = await LanguagesAPI.getLanguages(this.props.projectId, { showAll: true });
            this.setState({ languagesResponse });
        } catch (error) {
            console.error(error);
            ErrorUtils.showError("Failed to load languages.");
        }
    }

    async loadForbiddenWordsLists(options?: IGetForbiddenWordsListsOptions) {
        this.setState({ forbiddenWordsListsLoading: true });

        try {
            const forbiddenWordsListsResponse = await ForbiddenWordsListsAPI.getForbiddenWordsLists({
                projectId: options.projectId,
                page: options?.page,
                perPage: options?.perPage
            });
            this.setState({ forbiddenWordsListsResponse: forbiddenWordsListsResponse });
        } catch (error) {
            console.error(error);
            message.error("Failed to load forbidden words lists.");
        }

        this.setState({ forbiddenWordsListsLoading: false });
    }

    getRows = () => {
        if (
            !this.state.forbiddenWordsListsResponse ||
            !this.state.forbiddenWordsListsResponse.data ||
            !this.state.languagesResponse ||
            !this.state.languagesResponse.data
        ) {
            return [];
        }

        return this.state.forbiddenWordsListsResponse.data.map((forbiddenWordsList) => {
            const language = this.state.languagesResponse.data.find((languageToCheck) => {
                return forbiddenWordsList.attributes.language_id === languageToCheck.id;
            });

            const countryCode = APIUtils.getIncludedObject(
                language?.relationships.country_code.data,
                this.state.languagesResponse.included
            );

            return {
                key: forbiddenWordsList.attributes.id,
                name: forbiddenWordsList.attributes.name,
                wordsCount: forbiddenWordsList.attributes.words_count,
                checkedFor: forbiddenWordsList.attributes.language_id ? (
                    <LanguageNameWithFlag
                        languageName={language.attributes.name}
                        countryCode={countryCode?.attributes.code}
                    />
                ) : (
                    <span style={{ fontStyle: "italic", color: Styles.COLOR_TEXT_DISABLED }}>
                        Checked for all languages
                    </span>
                ),
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <a
                            onClick={() => {
                                this.setState({
                                    addForbiddenWordListDialogVisible: true,
                                    forbiddenWordsListToEdit: forbiddenWordsList
                                });
                            }}
                            style={{ marginRight: 16 }}
                        >
                            Edit
                        </a>
                        <Popconfirm
                            title="Do you want to delete this forbidden words list?"
                            onConfirm={async () => {
                                this.setState({ forbiddenWordsListsLoading: true });
                                try {
                                    await ForbiddenWordsListsAPI.deleteForbiddenWordsList({
                                        projectId: this.props.projectId,
                                        forbiddenWordsListId: forbiddenWordsList.id
                                    });
                                    message.success("Forbidden words list deleted");
                                } catch (error) {
                                    console.error(error);
                                    message.error("Failed to delete forbidden words list.");
                                }
                                await this.reloadTable();
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="top"
                        >
                            <DeleteLink style={{ marginRight: 24 }}>Delete</DeleteLink>
                        </Popconfirm>
                    </div>
                )
            };
        }, []);
    };

    getColumns = () => {
        const columns: any[] = [
            {
                title: "Name",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Words count",
                dataIndex: "wordsCount",
                key: "wordsCount"
            },
            {
                title: "Checked for",
                dataIndex: "checkedFor",
                key: "checkedFor"
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50
            }
        ];

        return columns;
    };

    reloadTable = async (options?: { page?: number; perPage?: number }) => {
        const fetchOptions: IGetForbiddenWordsListsOptions = { projectId: this.props.projectId, ...options } || {
            projectId: this.props.projectId
        };
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.loadForbiddenWordsLists(fetchOptions);
    };

    onDelete = async (forbiddenWordsListId: string) => {
        this.setState({ isDeleting: true });

        Modal.confirm({
            title: "Do you really want to delete the selected forbidden words lists?",
            content:
                "The content of this list will be lost and translations are no longer checked against these words.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: this.state.isDeleting,
            onOk: async () => {
                try {
                    const response = await ForbiddenWordsListsAPI.deleteForbiddenWordsList({
                        projectId: this.props.projectId,
                        forbiddenWordsListId: forbiddenWordsListId
                    });

                    if (!response.success) {
                        message.error("Failed to delete forbidden words list.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to delete forbidden words list.");
                    console.error(error);
                }

                this.reloadTable();

                this.setState({ isDeleting: false });
            },
            onCancel: () => {
                this.setState({ isDeleting: false });
            }
        });
    };

    render() {
        return (
            <>
                <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "flex-start" }}>
                    <h3>Forbidden words lists</h3>
                    <Button
                        type="default"
                        style={{ marginBottom: 16 }}
                        onClick={() => {
                            this.setState({ addForbiddenWordListDialogVisible: true });
                        }}
                        data-id={DATA_IDS.FORBIDDEN_WORDS_LIST_BUTTON_NEW}
                    >
                        Create new list
                    </Button>
                    <Table
                        dataSource={this.getRows()}
                        columns={this.getColumns()}
                        style={{ width: "100%" }}
                        bordered
                        loading={this.state.forbiddenWordsListsLoading}
                        pagination={{
                            pageSizeOptions: PAGE_SIZE_OPTIONS,
                            showSizeChanger: true,
                            current: this.state.page,
                            pageSize: this.state.perPage,
                            total:
                                (this.state.forbiddenWordsListsResponse &&
                                    this.state.forbiddenWordsListsResponse.meta.total) ||
                                0,
                            onChange: async (page: number, perPage: number) => {
                                const isPageSizeChange = perPage !== this.state.perPage;

                                if (isPageSizeChange) {
                                    this.setState({ page: 1, perPage: perPage });
                                    await this.reloadTable({ page: 1, perPage: perPage });
                                } else {
                                    this.setState({ page: page, perPage: perPage });
                                    await this.reloadTable({ page: page, perPage: perPage });
                                }
                            }
                        }}
                        locale={{
                            emptyText: (
                                <Empty
                                    description="No forbidden words lists found"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )
                        }}
                    />
                </div>

                <AddEditForbiddenWordsListForm
                    projectId={this.props.projectId}
                    forbiddenWordListToEdit={this.state.forbiddenWordsListToEdit}
                    visible={this.state.addForbiddenWordListDialogVisible}
                    onCancelRequest={() => {
                        this.setState({
                            addForbiddenWordListDialogVisible: false,
                            forbiddenWordsListToEdit: null
                        });
                    }}
                    onCreated={async () => {
                        message.success("The forbidden words list has successfully been created.");
                    }}
                    onUpdated={() => {
                        message.success("The forbidden words list has successfully been updated.");
                    }}
                    onChanged={async () => {
                        this.setState({
                            addForbiddenWordListDialogVisible: false,
                            forbiddenWordsListToEdit: null
                        });

                        await this.reloadTable();
                    }}
                />
            </>
        );
    }
}

export { ForbiddenWordsListsTable };
