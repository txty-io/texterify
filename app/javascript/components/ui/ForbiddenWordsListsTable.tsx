import { Button, Empty, message, Modal, Popconfirm, Table, Tooltip } from "antd";
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
import { AddEditForbiddenWordsListForm } from "../forms/AddEditForbiddenWordListForm";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { PAGE_SIZE_OPTIONS } from "./Config";
import { DATA_IDS } from "./DataIds";
import { DeleteLink } from "./DeleteLink";
import { LanguageNameWithFlag } from "./LanguageNameWithFlag";
import { Styles } from "./Styles";

interface IProps {
    linkedId?: string;
    linkedType?: IForbiddenWordsListLinkedTo;
}

interface IState {
    addForbiddenWordListDialogVisible: boolean;
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

        return this.state.forbiddenWordsListsResponse.data.map((forbiddenWordsList) => {
            const languageCode = APIUtils.getIncludedObject(
                forbiddenWordsList?.relationships.language_code.data,
                this.state.forbiddenWordsListsResponse.included
            );

            const countryCode = APIUtils.getIncludedObject(
                forbiddenWordsList?.relationships.country_code.data,
                this.state.forbiddenWordsListsResponse.included
            );

            const checkedFor =
                languageCode || countryCode ? (
                    <LanguageNameWithFlag
                        languageName={languageCode?.attributes.code}
                        countryCode={countryCode?.attributes.code}
                        showNameWithCountryCode
                    />
                ) : (
                    <span style={{ color: Styles.COLOR_TEXT_DISABLED }}>all languages</span>
                );

            return {
                key: forbiddenWordsList.attributes.id,
                name: forbiddenWordsList.attributes.name,
                wordsCount: forbiddenWordsList.attributes.words_count,
                checkedFor: checkedFor,
                controls: (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        {this.props.linkedType === "project" && forbiddenWordsList.attributes.organization_id ? (
                            <Tooltip title="Click to edit in organization">
                                <Link
                                    to={Routes.DASHBOARD.ORGANIZATION_FORBIDDEN_WORDS_RESOLVER({
                                        organizationId: forbiddenWordsList.attributes.organization_id
                                    })}
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    Inherited
                                </Link>
                            </Tooltip>
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
                                <DeleteLink
                                    onClick={() => {
                                        Modal.confirm({
                                            title: "Do you want to delete this forbidden words list?",
                                            content: "This cannot be undone.",
                                            okText: "Yes",
                                            okButtonProps: {
                                                danger: true
                                            },
                                            cancelText: "No",
                                            autoFocusButton: "cancel",
                                            onOk: async () => {
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

                                                this.setState({ page: 1, forbiddenWordsListsLoading: false });
                                                await this.reloadTable({ page: 1 });
                                            }
                                        });
                                    }}
                                >
                                    Delete
                                </DeleteLink>
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

    render() {
        return (
            <>
                <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "flex-start" }}>
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

                        this.setState({ page: 1 });
                        await this.reloadTable({ page: 1 });
                    }}
                />
            </>
        );
    }
}

export { ForbiddenWordsListsTable };
