import { Layout, message, Pagination, Skeleton, Typography } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { ValidationsAPI, IValidation } from "../../api/v1/ValidationsAPI";
import {
    IGetValidationViolationsResponse,
    IValidationViolation,
    ValidationViolationsAPI
} from "../../api/v1/ValidationViolationsAPI";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { PAGE_SIZE_OPTIONS } from "../../ui/Config";

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
                                        width: "100%"
                                    }}
                                    key={validationViolation.id}
                                >
                                    <div style={{ marginRight: "auto", width: "100%", display: "flex" }}>
                                        <div style={{ display: "flex", flexDirection: "column", marginRight: 16 }}>
                                            <div
                                                style={{
                                                    fontSize: 14,
                                                    wordBreak: "break-word",
                                                    color: "var(--error-color)"
                                                }}
                                            >
                                                {this.getValidationDescription(validationViolation, validation)}
                                            </div>
                                            <div
                                                style={{
                                                    wordBreak: "break-word",
                                                    marginTop: 12
                                                }}
                                            >
                                                <Typography.Text code style={{ whiteSpace: "pre-wrap" }}>
                                                    {translation.attributes.content}
                                                </Typography.Text>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", marginLeft: "auto" }}>
                                            <a
                                                onClick={async () => {
                                                    await ValidationsAPI.deleteValidationViolation(
                                                        this.props.match.params.projectId,
                                                        validationViolation.id
                                                    );
                                                }}
                                            >
                                                Ignore
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

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
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectIssuesSite };
