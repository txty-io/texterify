import { Empty, Layout, message, Popconfirm, Table, Tag } from "antd";
import { TableRowSelection } from "antd/lib/table/interface";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { IKey } from "../../api/v1/KeysAPI";
import { ITranslation } from "../../api/v1/TranslationsAPI";
import { IValidation, ValidationsAPI } from "../../api/v1/ValidationsAPI";
import {
    IGetValidationViolationsOptions,
    IGetValidationViolationsResponse,
    IValidationViolation,
    ValidationViolationsAPI
} from "../../api/v1/ValidationViolationsAPI";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Routes } from "../../routing/Routes";
import { ILanguage } from "../../api/v1/LanguagesAPI";
import { Flag } from "../../ui/Flag";

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

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    validationViolationsResponse: IGetValidationViolationsResponse;
    validationViolationsLoading: boolean;
    page: number;
    perPage: number;
    selectedRowKeys: any[];
}

@observer
class ProjectIssuesSite extends React.Component<IProps, IState> {
    state: IState = {
        validationViolationsResponse: null,
        validationViolationsLoading: true,
        page: 1,
        perPage: 10,
        selectedRowKeys: []
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
                projectId: this.props.match.params.projectId,
                options: {
                    page: options?.page,
                    perPage: options?.perPage
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
                        to={Routes.DASHBOARD.PROJECT_EDITOR_KEY.replace(
                            ":projectId",
                            this.props.match.params.projectId
                        ).replace(":keyId", key.id)}
                    >
                        {key?.attributes.name}
                    </Link>
                ),
                language: <Flag language={language} countryCode={countryCode} languageCode={languageCode} />,
                content: translation.attributes.content,
                description: this.getValidationDescription(validationViolation, validation),
                controls: (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Popconfirm
                            title="Do you want to delete this issue?"
                            onConfirm={async () => {
                                this.setState({ validationViolationsLoading: true });
                                try {
                                    await ValidationsAPI.deleteValidationViolation(
                                        this.props.match.params.projectId,
                                        validationViolation.id
                                    );
                                    dashboardStore.currentProject.attributes.issues_count--;
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
                            <DeleteLink>Delete</DeleteLink>
                        </Popconfirm>
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

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="projectIssues" />
                <Layout.Content
                    style={{
                        margin: "24px 16px 0",
                        minHeight: 360,
                        paddingBottom: 40,
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: 1200
                    }}
                >
                    <h1>Issues</h1>

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
                            onChange: async (page: number, _perPage: number) => {
                                this.setState({ page: page });
                                await this.reloadTable({ page: page });
                            },
                            onShowSizeChange: async (_current: number, size: number) => {
                                this.setState({ page: 1, perPage: size });
                                await this.reloadTable({ page: 1, perPage: size });
                            }
                        }}
                        locale={{
                            emptyText: <Empty description="No issues found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }}
                    />
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectIssuesSite };
