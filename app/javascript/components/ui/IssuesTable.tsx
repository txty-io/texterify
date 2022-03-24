import { Button, Empty, message, Modal, Popconfirm, Table, Tag } from "antd";
import { TableRowSelection } from "antd/lib/table/interface";
import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { APIUtils } from "../api/v1/APIUtils";
import { IKey } from "../api/v1/KeysAPI";
import { ILanguage } from "../api/v1/LanguagesAPI";
import { ITranslation } from "../api/v1/TranslationsAPI";
import { IValidation } from "../api/v1/ValidationsAPI";
import {
    IGetValidationViolationsOptions,
    IGetValidationViolationsResponse,
    IValidationViolation,
    ValidationViolationsAPI
} from "../api/v1/ValidationViolationsAPI";
import { Routes } from "../routing/Routes";
import { dashboardStore } from "../stores/DashboardStore";
import { PAGE_SIZE_OPTIONS } from "./Config";
import { Flag } from "./Flag";
import { Utils } from "./Utils";

const DeleteLink = styled.a`
    && {
        color: var(--error-color);

        &:hover {
            color: var(--error-color-hover);
        }
    }
`;

interface ITableRow {
    key: string;
    language: React.ReactNode;
    name: React.ReactNode;
    content: React.ReactNode;
    description: React.ReactNode;
    controls: React.ReactNode;
}

interface IProps {
    projectId: string;
    issuesType: "ignored" | "unignored";
}

interface IState {
    validationViolationsResponse: IGetValidationViolationsResponse;
    validationViolationsLoading: boolean;
    page: number;
    perPage: number;
    isDeleting: boolean;
    isUpdating: boolean;
    selectedRowKeys: React.Key[];
}

@observer
class IssuesTable extends React.Component<IProps, IState> {
    state: IState = {
        validationViolationsResponse: null,
        validationViolationsLoading: true,
        page: 1,
        perPage: 10,
        selectedRowKeys: [],
        isDeleting: false,
        isUpdating: false
    };

    rowSelection: TableRowSelection<ITableRow> = {
        onChange: (selectedRowKeys, _selectedRows) => {
            this.setState({
                selectedRowKeys: selectedRowKeys
            });
        },
        getCheckboxProps: () => {
            return {
                disabled: false
            };
        }
    };

    async componentDidMount() {
        await this.loadValidationViolations();
    }

    async loadValidationViolations(options?: { page?: number; perPage?: number }) {
        this.setState({ validationViolationsLoading: true });

        try {
            const validationViolationsResponse = await ValidationViolationsAPI.getAll({
                projectId: this.props.projectId,
                options: {
                    page: options?.page,
                    perPage: options?.perPage,
                    onlyIgnored: this.props.issuesType === "ignored",
                    onlyUnignored: this.props.issuesType === "unignored"
                }
            });
            this.setState({ validationViolationsResponse: validationViolationsResponse });
        } catch (error) {
            console.error(error);
            message.error("Failed to load validation violations.");
        }

        this.setState({ validationViolationsLoading: false });
    }

    getTranslationForViolation(violation: IValidationViolation): ITranslation {
        return this.state.validationViolationsResponse.included.find((included) => {
            return violation.attributes.translation_id === included.id && included.type === "translation";
        }) as ITranslation;
    }

    getKeyForTranslation(translation: ITranslation): IKey {
        return this.state.validationViolationsResponse.included.find((included) => {
            return translation.attributes.key_id === included.id && included.type === "key";
        }) as IKey;
    }

    getValidationDescription(validationViolation: IValidationViolation, validation: IValidation) {
        if (validationViolation.attributes.name) {
            if (validationViolation.attributes.name === "validate_double_whitespace") {
                return "Text contains a double whitespace";
            } else if (validationViolation.attributes.name === "validate_leading_whitespace") {
                return "Text starts with a whitespace";
            } else if (validationViolation.attributes.name === "validate_trailing_whitespace") {
                return "Text ends with a whitespace";
            } else if (validationViolation.attributes.name === "validate_https") {
                return "Text contains an insecure http:// link";
            } else {
                return validationViolation.attributes.name;
            }
        } else {
            return (
                <>
                    Text {validation.attributes.match} <Tag color="red">{validation.attributes.content}</Tag>
                </>
            );
        }
    }

    getRows = () => {
        if (!this.state.validationViolationsResponse || !this.state.validationViolationsResponse.data) {
            return [];
        }

        return this.state.validationViolationsResponse.data.map((validationViolation) => {
            const translation: ITranslation = APIUtils.getIncludedObject(
                validationViolation.relationships.translation.data,
                this.state.validationViolationsResponse.included
            );

            const language: ILanguage = APIUtils.getIncludedObject(
                translation.relationships.language.data,
                this.state.validationViolationsResponse.included
            );

            const countryCode = APIUtils.getIncludedObject(
                language.relationships.country_code.data,
                this.state.validationViolationsResponse.included
            );

            const languageCode = APIUtils.getIncludedObject(
                language.relationships.language_code.data,
                this.state.validationViolationsResponse.included
            );

            const validation: IValidation = APIUtils.getIncludedObject(
                validationViolation.relationships.validation.data,
                this.state.validationViolationsResponse.included
            );

            const key = this.getKeyForTranslation(this.getTranslationForViolation(validationViolation));

            return {
                key: validationViolation.attributes.id,
                name: (
                    <Link
                        to={Routes.DASHBOARD.PROJECT_EDITOR_KEY.replace(":projectId", this.props.projectId).replace(
                            ":keyId",
                            key.id
                        )}
                    >
                        {key?.attributes.name}
                    </Link>
                ),
                language: <Flag language={language} countryCode={countryCode} languageCode={languageCode} />,
                content: key.attributes.html_enabled
                    ? Utils.getHTMLContentPreview(translation.attributes.content)
                    : translation.attributes.content,
                description: this.getValidationDescription(validationViolation, validation),
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Popconfirm
                            title="Do you want to delete this issue?"
                            onConfirm={async () => {
                                this.setState({ validationViolationsLoading: true, selectedRowKeys: [] });
                                try {
                                    await ValidationViolationsAPI.delete({
                                        projectId: this.props.projectId,
                                        validationViolationId: validationViolation.id
                                    });
                                    dashboardStore.reloadCurrentProjectIssuesCount();
                                    message.success("Issue deleted");
                                } catch (error) {
                                    console.error(error);
                                    message.error("Failed to delete issue.");
                                }
                                await this.loadValidationViolations();
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="top"
                        >
                            <DeleteLink style={{ marginRight: 24 }}>Delete</DeleteLink>
                        </Popconfirm>

                        {this.props.issuesType === "unignored" && (
                            <Popconfirm
                                title="Do you want to ignore this issue?"
                                onConfirm={async () => {
                                    this.setState({ validationViolationsLoading: true, selectedRowKeys: [] });
                                    try {
                                        await ValidationViolationsAPI.update({
                                            projectId: this.props.projectId,
                                            validationViolationId: validationViolation.id,
                                            ignored: true
                                        });
                                        dashboardStore.reloadCurrentProjectIssuesCount();
                                        message.success("Issue ignored.");
                                    } catch (error) {
                                        console.error(error);
                                        message.error("Failed to ignore issue.");
                                    }
                                    await this.loadValidationViolations();
                                }}
                                okText="Yes"
                                cancelText="No"
                                placement="top"
                            >
                                <DeleteLink>Ignore</DeleteLink>
                            </Popconfirm>
                        )}

                        {this.props.issuesType === "ignored" && (
                            <Popconfirm
                                title="Do you want to unignore this issue?"
                                onConfirm={async () => {
                                    this.setState({ validationViolationsLoading: true, selectedRowKeys: [] });
                                    try {
                                        await ValidationViolationsAPI.update({
                                            projectId: this.props.projectId,
                                            validationViolationId: validationViolation.id,
                                            ignored: false
                                        });
                                        dashboardStore.reloadCurrentProjectIssuesCount();
                                        message.success("Issue unignored.");
                                    } catch (error) {
                                        console.error(error);
                                        message.error("Failed to unignore issue.");
                                    }
                                    await this.loadValidationViolations();
                                }}
                                okText="Yes"
                                cancelText="No"
                                placement="top"
                            >
                                <DeleteLink>Unignore</DeleteLink>
                            </Popconfirm>
                        )}
                    </div>
                )
            };
        }, []);
    };

    getColumns = () => {
        const columns: any[] = [
            {
                title: "Key",
                dataIndex: "name",
                key: "name"
            },
            {
                title: "Language",
                dataIndex: "language",
                key: "language"
            },
            {
                title: "Content",
                dataIndex: "content",
                key: "content"
            },
            {
                title: "Issue",
                dataIndex: "description",
                key: "description"
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50
            }
        ];

        return columns;
    };

    reloadTable = async (options?: IGetValidationViolationsOptions) => {
        const fetchOptions = options || {};
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.loadValidationViolations(fetchOptions);
    };

    onDelete = async () => {
        this.setState({ isDeleting: true });

        Modal.confirm({
            title: "Do you really want to delete the selected issues?",
            content:
                "After you deleted an issue it can stil occur again the next time the translations are checked. If you don't want to happen it again you must ignore the selected issues.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: this.state.isDeleting,
            onOk: async () => {
                try {
                    const response = await ValidationViolationsAPI.deleteMultiple({
                        projectId: this.props.projectId,
                        validationViolationIds: this.state.selectedRowKeys as string[]
                    });

                    if (!response.success) {
                        message.error("Failed to delete issues.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to delete issues.");
                    console.error(error);
                }

                this.reloadTable();

                this.setState({ isDeleting: false, selectedRowKeys: [] });

                void dashboardStore.reloadCurrentProjectIssuesCount();
            },
            onCancel: () => {
                this.setState({ isDeleting: false });
            }
        });
    };

    onIgnore = async () => {
        this.setState({ isUpdating: true });

        Modal.confirm({
            title: "Do you really want to ignore the selected issues?",
            content: "After you ignored an issue it will no longer occur the next time the translations are checked.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: this.state.isUpdating,
            onOk: async () => {
                try {
                    const response = await ValidationViolationsAPI.updateMultiple({
                        projectId: this.props.projectId,
                        validationViolationIds: this.state.selectedRowKeys as string[],
                        ignored: true
                    });

                    if (!response.success) {
                        message.error("Failed to ignore issues.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to ignore issues.");
                    console.error(error);
                }

                this.reloadTable();

                this.setState({ isUpdating: false, selectedRowKeys: [] });

                void dashboardStore.reloadCurrentProjectIssuesCount();
            },
            onCancel: () => {
                this.setState({ isUpdating: false });
            }
        });
    };

    onUnignore = async () => {
        this.setState({ isUpdating: true });

        Modal.confirm({
            title: "Do you really want to unignore the selected issues?",
            content: "Your translations will then be checked again for the selected issues.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: this.state.isUpdating,
            onOk: async () => {
                try {
                    const response = await ValidationViolationsAPI.updateMultiple({
                        projectId: this.props.projectId,
                        validationViolationIds: this.state.selectedRowKeys as string[],
                        ignored: false
                    });

                    if (!response.success) {
                        message.error("Failed to unignore issues.");
                        return;
                    }
                } catch (error) {
                    message.error("Failed to unignore issues.");
                    console.error(error);
                }

                this.reloadTable();

                this.setState({ isUpdating: false, selectedRowKeys: [] });

                void dashboardStore.reloadCurrentProjectIssuesCount();
            },
            onCancel: () => {
                this.setState({ isUpdating: false });
            }
        });
    };

    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: 24, display: "flex" }}>
                    <Button
                        danger
                        onClick={this.onDelete}
                        disabled={this.state.selectedRowKeys.length === 0}
                        loading={this.state.isDeleting}
                    >
                        Delete selected
                    </Button>

                    {this.props.issuesType === "unignored" && (
                        <Button
                            danger
                            onClick={this.onIgnore}
                            disabled={this.state.selectedRowKeys.length === 0}
                            loading={this.state.isUpdating}
                            style={{ marginLeft: 10 }}
                        >
                            Ignore selected
                        </Button>
                    )}

                    {this.props.issuesType === "ignored" && (
                        <Button
                            danger
                            onClick={this.onUnignore}
                            disabled={this.state.selectedRowKeys.length === 0}
                            loading={this.state.isUpdating}
                            style={{ marginLeft: 10 }}
                        >
                            Unignore selected
                        </Button>
                    )}
                </div>

                <Table
                    rowSelection={this.rowSelection}
                    dataSource={this.getRows()}
                    columns={this.getColumns()}
                    style={{ width: "100%" }}
                    bordered
                    loading={this.state.validationViolationsLoading}
                    pagination={{
                        pageSizeOptions: PAGE_SIZE_OPTIONS,
                        showSizeChanger: true,
                        current: this.state.page,
                        pageSize: this.state.perPage,
                        total:
                            (this.state.validationViolationsResponse &&
                                this.state.validationViolationsResponse.meta.total) ||
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
                        emptyText: <Empty description="No issues found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    }}
                />
            </div>
        );
    }
}

export { IssuesTable };
