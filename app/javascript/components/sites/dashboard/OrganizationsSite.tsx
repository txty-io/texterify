import { ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Empty, Input, Layout, List, message, Pagination, Tooltip } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import styled from "styled-components";
import { IGetOrganizationsOptions, IGetOrganizationsResponse, OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { NewOrganizationFormModal } from "../../forms/NewOrganizationFormModal";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { IOrganization } from "../../stores/DashboardStore";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { ListContent } from "../../ui/ListContent";
import { OrganizationAvatar } from "../../ui/OrganizationAvatar";
import { PrimaryButton } from "../../ui/PrimaryButton";

const OrganizationInfoWrapper = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;

    .dark-theme & {
        color: #fff;
    }
`;

type IProps = RouteComponentProps;
interface IState {
    organizationsResponse: IGetOrganizationsResponse;
    addDialogVisible: boolean;
    loading: boolean;
    perPage: number;
    page: number;
    search: string;
}

class OrganizationsSiteUnwrapped extends React.Component<IProps, IState> {
    debouncedSearchReloader = _.debounce(
        async (value) => {
            this.setState({ search: value, page: 1 });
            await this.reloadTable({ search: value, page: 1 });
        },
        500,
        { trailing: true }
    );

    state: IState = {
        organizationsResponse: null,
        addDialogVisible: false,
        loading: true,
        perPage: DEFAULT_PAGE_SIZE,
        page: 1,
        search: ""
    };

    async componentDidMount() {
        await this.reloadTable();
    }

    fetchOrganizations = async (options?: IGetOrganizationsOptions) => {
        try {
            const responseOrganizations = await OrganizationsAPI.getOrganizations(options);

            this.setState({
                organizationsResponse: responseOrganizations
            });
        } catch (e) {
            console.error(e);
            message.error("Failed to load organizations.");
        }
    };

    reloadTable = async (options?: IGetOrganizationsOptions) => {
        this.setState({ loading: true });
        const fetchOptions = options || {};
        fetchOptions.search = (options && options.search) || this.state.search;
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.fetchOrganizations(fetchOptions);
        this.setState({ loading: false });
    };

    getRows = () => {
        if (!this.state.organizationsResponse) {
            return [];
        }

        return this.state.organizationsResponse.data;
    };

    openOrganization = (organization: IOrganization) => {
        this.props.history.push(Routes.DASHBOARD.ORGANIZATION.replace(":organizationId", organization.id));
    };

    onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchReloader(event.target.value);
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                        <h1>Organizations</h1>
                        <p>Organizations help you to easily share and manage projects within your company.</p>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ flexGrow: 1 }}>
                                <PrimaryButton
                                    onClick={() => {
                                        history.push(Routes.DASHBOARD.SETUP_ORGANIZATION_NEW);
                                    }}
                                >
                                    Create organization
                                </PrimaryButton>
                            </div>
                            <Input.Search
                                placeholder="Search organizations"
                                onChange={this.onSearch}
                                style={{ maxWidth: "50%" }}
                            />
                        </div>

                        <List
                            loading={this.state.loading}
                            size="default"
                            locale={{
                                emptyText: (
                                    <Empty description="No organizations found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )
                            }}
                            dataSource={this.getRows()}
                            renderItem={(item) => {
                                return (
                                    <List.Item key={item.id}>
                                        <List.Item.Meta
                                            title={
                                                <ListContent
                                                    onClick={(): void => {
                                                        this.openOrganization(
                                                            _.find(this.state.organizationsResponse.data, {
                                                                id: item.id
                                                            })
                                                        );
                                                    }}
                                                    role="button"
                                                >
                                                    <OrganizationAvatar
                                                        organization={_.find(this.state.organizationsResponse.data, {
                                                            id: item.id
                                                        })}
                                                        style={{ marginRight: 16 }}
                                                    />
                                                    <OrganizationInfoWrapper>
                                                        {item.attributes.name}
                                                    </OrganizationInfoWrapper>
                                                </ListContent>
                                            }
                                        />
                                        {item.attributes.current_user_deactivated && (
                                            <Tooltip title="Your account has been disabled for this organization.">
                                                <ExclamationCircleFilled
                                                    style={{ color: "var(--color-warn)", marginRight: 24 }}
                                                />
                                            </Tooltip>
                                        )}
                                        <Button
                                            onClick={(): void => {
                                                this.openOrganization(
                                                    _.find(this.state.organizationsResponse.data, { id: item.id })
                                                );
                                            }}
                                        >
                                            More
                                        </Button>
                                    </List.Item>
                                );
                            }}
                        />
                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                            <Pagination
                                pageSizeOptions={PAGE_SIZE_OPTIONS}
                                showSizeChanger
                                pageSize={this.state.perPage}
                                current={this.state.page}
                                total={
                                    (this.state.organizationsResponse &&
                                        this.state.organizationsResponse.data &&
                                        this.state.organizationsResponse.meta.total) ||
                                    0
                                }
                                onChange={async (page: number, _perPage: number) => {
                                    this.setState({ page: page });
                                    await this.reloadTable({ page: page });
                                }}
                                onShowSizeChange={async (_current: number, size: number) => {
                                    this.setState({ page: 1, perPage: size });
                                    await this.reloadTable({ page: 1, perPage: size });
                                }}
                            />
                        </div>
                    </Layout.Content>
                </Layout>

                <NewOrganizationFormModal
                    visible={this.state.addDialogVisible}
                    onCancelRequest={() => {
                        this.setState({ addDialogVisible: false });
                    }}
                    newOrganizationFormProps={{
                        onChanged: (organization: IOrganization) => {
                            this.props.history.push(
                                Routes.DASHBOARD.ORGANIZATION.replace(":organizationId", organization.id)
                            );
                        },
                        onError: () => {
                            message.error("Failed to create organization.");
                        }
                    }}
                />
            </>
        );
    }
}

const OrganizationsSite = withRouter(OrganizationsSiteUnwrapped);
export { OrganizationsSite };
