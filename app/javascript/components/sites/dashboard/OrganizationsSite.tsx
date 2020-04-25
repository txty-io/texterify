import { Button, Empty, Input, Layout, List, message, Pagination } from "antd";
import * as _ from "lodash";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { NewOrganizationFormModal } from "../../forms/NewOrganizationFormModal";
import { Routes } from "../../routing/Routes";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "../../ui/Config";
import { ListContent } from "../../ui/ListContent";
import { OrganizationAvatar } from "../../ui/OrganizationAvatar";
import { PrimaryButton } from "../../ui/PrimaryButton";

type IProps = RouteComponentProps;
interface IState {
    organizationsResponse: any;
    addDialogVisible: boolean;
    perPage: number;
    page: number;
    search: string;
}

class OrganizationsSiteUnwrapped extends React.Component<IProps, IState> {
    debouncedSearchReloader: any = _.debounce(
        async (value) => {
            this.setState({ search: value, page: 0 });
            await this.reloadTable({ search: value, page: 0 });
        },
        500,
        { trailing: true }
    );

    state: IState = {
        organizationsResponse: null,
        addDialogVisible: false,
        perPage: DEFAULT_PAGE_SIZE,
        page: 0,
        search: ""
    };

    async componentDidMount() {
        await this.fetchOrganizations();
    }

    fetchOrganizations = async (options?: any) => {
        try {
            const responseOrganizations = await OrganizationsAPI.getOrganizations(options);

            this.setState({
                organizationsResponse: responseOrganizations
            });
        } catch (e) {
            console.error(e);
        }
    };

    reloadTable = async (options?: any) => {
        const fetchOptions = options || {};
        fetchOptions.search = (options && options.search) || this.state.search;
        fetchOptions.page = (options && options.page) || this.state.page;
        fetchOptions.perPage = (options && options.perPage) || this.state.perPage;
        await this.fetchOrganizations(fetchOptions);
    };

    getRows = (): any[] => {
        if (!this.state.organizationsResponse) {
            return [];
        }

        return (
            this.state.organizationsResponse.data &&
            this.state.organizationsResponse.data.map((organization: any) => {
                return {
                    key: organization.id,
                    name: organization.attributes.name,
                    description: organization.attributes.description
                };
            }, [])
        );
    };

    openOrganization = (organization: any) => {
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
                        <h1 style={{ flexGrow: 1 }}>Organizations</h1>
                        <p>Organizations help you to easily share and manage projects within your company.</p>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                            <div style={{ flexGrow: 1 }}>
                                <PrimaryButton
                                    onClick={() => {
                                        this.setState({ addDialogVisible: true });
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
                            size="small"
                            locale={{
                                emptyText: (
                                    <Empty description="No organizations found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )
                            }}
                            dataSource={this.getRows()}
                            renderItem={(item) => {
                                return (
                                    <List.Item key={item.title}>
                                        <List.Item.Meta
                                            title={
                                                <ListContent
                                                    onClick={(): void => {
                                                        this.openOrganization(
                                                            _.find(this.state.organizationsResponse.data, {
                                                                id: item.key
                                                            })
                                                        );
                                                    }}
                                                    role="button"
                                                >
                                                    <OrganizationAvatar
                                                        organization={_.find(this.state.organizationsResponse.data, {
                                                            id: item.key
                                                        })}
                                                        style={{ marginRight: 16 }}
                                                    />
                                                    <div>
                                                        {item.name}
                                                        <div style={{ fontSize: 12 }}>{item.description}</div>
                                                    </div>
                                                </ListContent>
                                            }
                                        />
                                        <Button
                                            onClick={(): void => {
                                                this.openOrganization(
                                                    _.find(this.state.organizationsResponse.data, { id: item.key })
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
                                    this.setState({ perPage: size });
                                    await this.reloadTable({ perPage: size });
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
                        onCreated: (organizationId: string) => {
                            this.props.history.push(
                                Routes.DASHBOARD.ORGANIZATION.replace(":organizationId", organizationId)
                            );
                        },
                        onError: (errors) => {
                            console.error(errors);
                            message.error("Failed to create organization.");
                        }
                    }}
                />
            </>
        );
    }
}

const OrganizationsSite: any = withRouter(OrganizationsSiteUnwrapped);
export { OrganizationsSite };
