import { Button, Empty, message, Modal, Popconfirm, Table } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { APIUtils } from "../api/v1/APIUtils";
import {
    ForbiddenWordsListsAPI,
    IForbiddenWordsList,
    IForbiddenWordsListLinkedTo,
    IGetForbiddenWordsListsOptions,
    IGetForbiddenWordsListsResponse
} from "../api/v1/ForbiddenWordsListsAPI";
import { IGetLanguagesResponse, LanguagesAPI } from "../api/v1/LanguagesAPI";
import { AddEditForbiddenWordsListForm } from "../forms/AddEditForbiddenWordListForm";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { PAGE_SIZE_OPTIONS } from "./Config";
import { DATA_IDS } from "./DataIds";
import { DeleteLink } from "./DeleteLink";
import { ErrorUtils } from "./ErrorUtils";
import { LanguageNameWithFlag } from "./LanguageNameWithFlag";
import { Styles } from "./Styles";

interface IProps {
    linkedId?: string;
    linkedType?: IForbiddenWordsListLinkedTo;
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

        if (this.props.linkedType === "project") {
            try {
                const languagesResponse = await LanguagesAPI.getLanguages(this.props.linkedId, { showAll: true });
                this.setState({ languagesResponse });
            } catch (error) {
                console.error(error);
                ErrorUtils.showError("Failed to load languages.");
            }
        }
    }

    async loadForbiddenWordsLists(options?: IGetForbiddenWordsListsOptions) {
        if (dashboardStore.featureEnabled("FEATURE_VALIDATIONS", this.props.linkedType)) {
            this.setState({ forbiddenWordsListsLoading: true });

            try {
                const forbiddenWordsListsResponse = await ForbiddenWordsListsAPI.getForbiddenWordsLists({
                    linkedId: options.linkedId,
                    linkedType: options.linkedType,
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
    }

    getRows = () => {
        if (!this.state.forbiddenWordsListsResponse || !this.state.forbiddenWordsListsResponse.data) {
            return [];
        }

        if (
            this.props.linkedType === "project" &&
            (!this.state.languagesResponse || !this.state.languagesResponse.data)
        ) {
            return [];
        }

        return this.state.forbiddenWordsListsResponse.data.map((forbiddenWordsList) => {
            let checkedFor;

            if (this.props.linkedType === "project") {
                const language = this.state.languagesResponse.data.find((languageToCheck) => {
                    return forbiddenWordsList.attributes.language_id === languageToCheck.id;
                });

                const countryCode = APIUtils.getIncludedObject(
                    language?.relationships.country_code.data,
                    this.state.languagesResponse.included
                );

                checkedFor = forbiddenWordsList.attributes.language_id ? (
                    <LanguageNameWithFlag
                        languageName={language.attributes.name}
                        countryCode={countryCode?.attributes.code}
                    />
                ) : (
                    <span style={{ fontStyle: "italic", color: Styles.COLOR_TEXT_DISABLED }}>
                        Checked for all languages
                    </span>
                );
            } else {
                checkedFor = (
                    <span style={{ fontStyle: "italic", color: Styles.COLOR_TEXT_DISABLED }}>
                        Checked for all languages
                    </span>
                );
            }

            return {
                key: forbiddenWordsList.attributes.id,
                name: forbiddenWordsList.attributes.name,
                wordsCount: forbiddenWordsList.attributes.words_count,
                checkedFor: checkedFor,
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {this.props.linkedType === "project" && forbiddenWordsList.attributes.organization_id ? (
                            <Link
                                to={Routes.DASHBOARD.ORGANIZATION_VALIDATIONS_RESOLVER({
                                    organizationId: forbiddenWordsList.attributes.organization_id
                                })}
                                style={{ fontStyle: "italic" }}
                            >
                                Organization validation
                            </Link>
                        ) : (
                            <>
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
                                                linkedId: this.props.linkedId,
                                                linkedType: this.props.linkedType,
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
                                    <DeleteLink>Delete</DeleteLink>
                                </Popconfirm>
                            </>
                        )}
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
        const fetchOptions: IGetForbiddenWordsListsOptions = {
            linkedId: this.props.linkedId,
            linkedType: this.props.linkedType,
            ...options
        } || {
            linkedId: this.props.linkedId,
            linkedType: this.props.linkedType
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
                        linkedId: this.props.linkedId,
                        linkedType: this.props.linkedType,
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
                        disabled={!dashboardStore.featureEnabled("FEATURE_VALIDATIONS", this.props.linkedType)}
                    >
                        Create new list
                    </Button>
                    <Table
                        dataSource={this.getRows()}
                        columns={this.getColumns()}
                        style={{ width: "100%" }}
                        bordered
                        loading={
                            !dashboardStore.featureEnabled("FEATURE_VALIDATIONS", this.props.linkedType) ||
                            this.state.forbiddenWordsListsLoading
                        }
                        pagination={{
                            pageSizeOptions: PAGE_SIZE_OPTIONS,
                            showSizeChanger: true,
                            current: this.state.page,
                            pageSize: this.state.perPage,
                            total: this.state.forbiddenWordsListsResponse?.meta?.total || 0,
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
                    linkedId={this.props.linkedId}
                    linkedType={this.props.linkedType}
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
