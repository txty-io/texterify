import { Empty, Layout, message, Pagination, Skeleton, Tag, Typography } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { IKey } from "../../api/v1/KeysAPI";
import { ITranslation } from "../../api/v1/TranslationsAPI";
import { IValidation, ValidationsAPI } from "../../api/v1/ValidationsAPI";
import {
    IGetValidationViolationsResponse,
    IValidationViolation,
    ValidationViolationsAPI
} from "../../api/v1/ValidationViolationsAPI";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { HighlightBox } from "../../ui/HighlightBox";
import { Styles } from "../../ui/Styles";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    validationViolationsResponse: IGetValidationViolationsResponse;
    validationViolationsLoading: boolean;
    page: number;
    perPage: number;
}

@observer
class ProjectIssuesSite extends React.Component<IProps, IState> {
    state: IState = {
        validationViolationsResponse: null,
        validationViolationsLoading: true,
        page: 1,
        perPage: 10
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
            return `Text ${validation.attributes.match} ${validation.attributes.content}`;
        }
    }

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
                        maxWidth: 800
                    }}
                >
                    <h1>Issues</h1>

                    {this.state.validationViolationsLoading && (
                        <div style={{ maxWidth: 480, width: "100%" }}>
                            <Skeleton active />
                        </div>
                    )}

                    {!this.state.validationViolationsLoading &&
                        this.state.validationViolationsResponse?.data.map((validationViolation) => {
                            const translation = APIUtils.getIncludedObject(
                                validationViolation.relationships.translation.data,
                                this.state.validationViolationsResponse.included
                            );

                            const validation = APIUtils.getIncludedObject(
                                validationViolation.relationships.validation.data,
                                this.state.validationViolationsResponse.included
                            );

                            return (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: 16,
                                        marginTop: 16,
                                        width: "100%"
                                    }}
                                    key={validationViolation.id}
                                >
                                    <div style={{ marginRight: "auto", width: "100%", display: "flex" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                flexGrow: 1,
                                                marginRight: 16
                                            }}
                                        >
                                            <div>
                                                <span style={{ fontWeight: "bolder", marginRight: 8 }}>Key:</span>
                                                {
                                                    this.getKeyForTranslation(
                                                        this.getTranslationForViolation(validationViolation)
                                                    )?.attributes.name
                                                }
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    wordBreak: "break-word",
                                                    marginTop: 8
                                                }}
                                            >
                                                <Tag color="red">
                                                    {this.getValidationDescription(validationViolation, validation)}
                                                </Tag>
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: 12,
                                                    display: "grid",
                                                    gridTemplateColumns: "1fr 1fr",
                                                    columnGap: "24px",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <HighlightBox
                                                    style={{
                                                        whiteSpace: "pre-wrap",
                                                        textDecorationLine: "underline",
                                                        textDecorationColor: "var(--error-color)",
                                                        textUnderlinePosition: "under"
                                                    }}
                                                >
                                                    {translation.attributes.content}
                                                </HighlightBox>
                                                <a
                                                    onClick={async () => {
                                                        try {
                                                            await ValidationsAPI.deleteValidationViolation(
                                                                this.props.match.params.projectId,
                                                                validationViolation.id
                                                            );
                                                            dashboardStore.currentProject.attributes.issues_count--;
                                                            message.success("Issue ignored");
                                                        } catch (error) {
                                                            console.error(error);
                                                            message.error("Failed to delete issue.");
                                                        }
                                                        await this.loadValidationViolations();
                                                    }}
                                                >
                                                    Ignore
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    {!this.state.validationViolationsLoading &&
                        this.state.validationViolationsResponse?.data.length > 0 && (
                            <Pagination
                                pageSizeOptions={PAGE_SIZE_OPTIONS}
                                showSizeChanger
                                pageSize={this.state.perPage}
                                current={this.state.page}
                                total={
                                    (this.state.validationViolationsResponse &&
                                        this.state.validationViolationsResponse.meta &&
                                        this.state.validationViolationsResponse.meta.total) ||
                                    0
                                }
                                onChange={async (page: number, _perPage: number) => {
                                    this.setState({ page: page });
                                    await this.loadValidationViolations({ page: page });
                                }}
                                onShowSizeChange={async (_current: number, size: number) => {
                                    this.setState({ page: 1, perPage: size });
                                    await this.loadValidationViolations({ page: 1, perPage: size });
                                }}
                                style={{ marginTop: 24, marginLeft: "auto" }}
                            />
                        )}

                    {!this.state.validationViolationsLoading &&
                        this.state.validationViolationsResponse?.data.length === 0 && (
                            <Empty description="No issues found." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectIssuesSite };
