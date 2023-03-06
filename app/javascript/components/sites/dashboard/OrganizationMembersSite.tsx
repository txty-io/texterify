import { QuestionCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { Button, Empty, Input, Layout, message, Modal, Popconfirm, Select, Table, Tag, Tooltip } from "antd";
import * as _ from "lodash";
import { observer } from "mobx-react";
import moment from "moment";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { IGetOrganizationInvitesResponse, OrganizationInvitesAPI } from "../../api/v1/OrganizationInvitesAPI";
import {
    IGetOrganizationUsersResponse,
    IGetProjectUsersResponse,
    IUser,
    OrganizationMembersAPI
} from "../../api/v1/OrganizationMembersAPI";
import { OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { IProject } from "../../api/v1/ProjectsAPI";
import { InviteUserFormModal } from "../../forms/InviteUserFormModal";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore } from "../../stores/DashboardStore";
import { IUserRole } from "../../types/IUserRole";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ErrorUtils } from "../../ui/ErrorUtils";
import { RolesLegend } from "../../ui/RolesLegend";
import { UserAvatar } from "../../ui/UserAvatar";
import { Utils } from "../../ui/Utils";
import { PermissionUtils } from "../../utilities/PermissionUtils";

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    getOrganizationUsersResponse: IGetOrganizationUsersResponse;
    getProjectUsersResponse: IGetProjectUsersResponse;
    getOrganizationInvitesResponse: IGetOrganizationInvitesResponse;
    deleteDialogVisible: boolean;
    search: string;
    loading: boolean;
    inviteDialogOpen: boolean;
    inviteRole: string;
    userActivating: boolean;
}

interface IOrganizationUserRow {
    id: string;
    key: string;
    user: IUser;
    username: string;
    email: string;
    role: IUserRole;
    deactivated_for_organization: boolean;
    deactivated_for_instance: boolean;
    projects: {
        role: IUserRole;
        project: IProject;
    }[];
}

interface IProjectUserRow {
    id: string;
    key: string;
    user: IUser;
    deactivated_for_project: boolean;
    deactivated_for_instance: boolean;
    projects: {
        role: IUserRole;
        project: IProject;
    }[];
}

@observer
class OrganizationMembersSite extends React.Component<IProps, IState> {
    state: IState = {
        getOrganizationUsersResponse: null,
        getProjectUsersResponse: null,
        getOrganizationInvitesResponse: null,
        deleteDialogVisible: false,
        search: "",
        loading: true,
        inviteDialogOpen: false,
        inviteRole: "translator",
        userActivating: false
    };

    debouncedSearchReloader = _.debounce(
        async (value) => {
            this.setState({ search: value });
            await this.reload({ search: value });
        },
        500,
        { trailing: true }
    );

    async componentDidMount() {
        await this.reload();
    }

    reload = async (options?: { search: string }) => {
        this.setState({ loading: true });

        const fetchOptions = options || ({} as any);
        fetchOptions.search = (options && options.search) || this.state.search;

        try {
            const responseGetMembers = await OrganizationMembersAPI.getMembers(
                this.props.match.params.organizationId,
                options
            );
            const responseGetProjectMembers = await OrganizationMembersAPI.getProjectMembers(
                this.props.match.params.organizationId,
                options
            );
            const responseGetOrganizationInvites = await OrganizationInvitesAPI.getAll({
                organizationId: this.props.match.params.organizationId
            });

            this.setState({
                getOrganizationUsersResponse: responseGetMembers,
                getProjectUsersResponse: responseGetProjectMembers,
                getOrganizationInvitesResponse: responseGetOrganizationInvites
            });
        } catch (e) {
            console.error(e);
        }

        this.setState({ loading: false });
    };

    getOrganizationUsersRows = (): IOrganizationUserRow[] => {
        if (!this.state.getOrganizationUsersResponse?.data) {
            return [];
        }

        return this.state.getOrganizationUsersResponse.data.map((organizationUser) => {
            const user: IUser = APIUtils.getIncludedObject(
                organizationUser.relationships.user.data,
                this.state.getOrganizationUsersResponse.included
            );

            return {
                id: user.id,
                key: user.id,
                user: user,
                username: user.attributes.username,
                email: user.attributes.email,
                role: user.attributes.role_organization,
                deactivated_for_organization: organizationUser.attributes.deactivated,
                deactivated_for_instance: user.attributes.deactivated,
                projects: this.state.getProjectUsersResponse.data
                    .filter((projectUser) => {
                        const projectUserUser = APIUtils.getIncludedObject(
                            projectUser.relationships.user.data,
                            this.state.getProjectUsersResponse.included
                        );

                        return user.id === projectUserUser.id;
                    })
                    .map((projectUser) => {
                        const project: IProject = APIUtils.getIncludedObject(
                            projectUser.relationships.project.data,
                            this.state.getProjectUsersResponse.included
                        );

                        return {
                            role: projectUser.attributes.role,
                            project: project
                        };
                    })
            };
        }, []);
    };

    getProjectUsersRows = (): IProjectUserRow[] => {
        if (!this.state.getProjectUsersResponse?.data) {
            return [];
        }

        const combined: {
            [key: string]: {
                role: IUserRole;
                project: IProject;
            }[];
        } = {};
        this.state.getProjectUsersResponse.data
            .filter((projectUser) => {
                return !this.state.getOrganizationUsersResponse.data.find((user) => {
                    const projectUserUser = APIUtils.getIncludedObject(
                        projectUser.relationships.user.data,
                        this.state.getProjectUsersResponse.included
                    );

                    return user.id === projectUserUser.id;
                });
            })
            .forEach((projectUser) => {
                const project = APIUtils.getIncludedObject(
                    projectUser.relationships.project.data,
                    this.state.getProjectUsersResponse.included
                );

                if (!combined[projectUser.id]) {
                    combined[projectUser.id] = [];
                }

                combined[projectUser.id].push({
                    role: projectUser.attributes.role,
                    project: project
                });
            });

        const result: IProjectUserRow[] = [];
        for (const [key, value] of Object.entries(combined)) {
            const projectUser = this.state.getProjectUsersResponse?.data?.find((pu) => {
                return pu.id === key;
            });
            const user = this.state.getProjectUsersResponse?.included?.find((included) => {
                return included.type === "user" && included.id === projectUser.attributes.user_id;
            }) as IUser;

            result.push({
                id: key,
                key: key,
                user: user,
                projects: value,
                deactivated_for_project: projectUser?.attributes.deactivated,
                deactivated_for_instance: user?.attributes.deactivated
            });
        }

        return result;
    };

    getOrganizationInvitesRows = () => {
        if (!this.state.getOrganizationInvitesResponse?.data) {
            return [];
        }

        return this.state.getOrganizationInvitesResponse.data.map((invite) => {
            return {
                id: invite.id,
                key: invite.id,
                email: invite.attributes.email,
                role: invite.attributes.role,
                created_at: invite.attributes.created_at,
                controls: (
                    <Popconfirm
                        title="Do you want to withdraw this invitation?"
                        onConfirm={async () => {
                            this.setState({ loading: true });
                            try {
                                await OrganizationInvitesAPI.delete({
                                    organizationId: invite.attributes.organization_id,
                                    inviteId: invite.id
                                });

                                await this.reload();
                            } catch (error) {
                                console.error(error);
                            }

                            this.setState({ loading: false });
                        }}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger>Withdraw invite</Button>
                    </Popconfirm>
                )
            };
        }, []);
    };

    hasOnlyOneOwner = () => {
        const ownerRows = this.getOrganizationUsersRows().filter((row) => {
            return PermissionUtils.isOwner(row.role);
        });

        return ownerRows.length === 1;
    };

    getColumns = (type: "organization" | "project") => {
        let columns = [
            {
                title: "",
                key: "image",
                width: 73, // width of cell with avatar in it
                render: (_text, record) => {
                    return <UserAvatar user={record.user.attributes} />;
                }
            },
            {
                title: "Username",
                key: "username",
                render: (_text, record: IOrganizationUserRow | IProjectUserRow) => {
                    return (
                        <>
                            <span style={{ color: "var(--full-color)", fontWeight: "bold" }}>
                                {record.user.attributes.username}
                            </span>
                            {((record as IOrganizationUserRow).deactivated_for_organization ||
                                (record as IProjectUserRow).deactivated_for_project) && (
                                <Tooltip title="User has been deactivated for this organization.">
                                    <Tag className="app-table-row-disabled-skip" style={{ marginLeft: 24 }} color="red">
                                        Deactivated
                                    </Tag>
                                </Tooltip>
                            )}
                            {record.deactivated_for_instance && (
                                <Tooltip title="User account has been deactivated.">
                                    <Tag className="app-table-row-disabled-skip" style={{ marginLeft: 24 }} color="red">
                                        Deactivated account
                                    </Tag>
                                </Tooltip>
                            )}
                        </>
                    );
                }
            },
            {
                title: "E-Mail",
                key: "email",
                render: (_text, record) => {
                    return <span style={{ color: "var(--full-color)" }}>{record.user.attributes.email}</span>;
                }
            }
        ];

        if (type === "organization") {
            columns = columns.concat([
                {
                    title: "Role",
                    key: "role",
                    width: 320,
                    render: (_text, record) => {
                        return (
                            <Select
                                showSearch
                                placeholder="Select a role"
                                optionFilterProp="children"
                                filterOption
                                style={{ width: "100%" }}
                                value={record.role}
                                onChange={async (value: string) => {
                                    try {
                                        const response = await OrganizationMembersAPI.updateMember(
                                            this.props.match.params.organizationId,
                                            record.id,
                                            value
                                        );

                                        if (response.error) {
                                            if (response.message === "BASIC_PERMISSION_SYSTEM_FEATURE_NOT_AVAILABLE") {
                                                if (dashboardStore.currentOrganization) {
                                                    ErrorUtils.showError(
                                                        "Please upgrade to a paid plan to add users to this project."
                                                    );
                                                } else {
                                                    ErrorUtils.showError(
                                                        "This feature is not available for private projects. Please move your project to an organization."
                                                    );
                                                }
                                            }
                                        } else if (response.errors) {
                                            ErrorUtils.showErrors(response.errors);
                                        } else {
                                            message.success("User role updated successfully.");

                                            // If the current users permission changed we reload the current organization.
                                            if (record.id === authStore.currentUser.id) {
                                                const getOrganizationResponse = await OrganizationsAPI.getOrganization(
                                                    this.props.match.params.organizationId
                                                );
                                                if (getOrganizationResponse.errors) {
                                                    this.props.history.push(Routes.DASHBOARD.ORGANIZATIONS);
                                                } else {
                                                    dashboardStore.currentOrganization = getOrganizationResponse.data;
                                                }
                                            }

                                            await this.reload();
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        message.error("Error while updating user role.");
                                    }
                                }}
                                disabled={
                                    (!(
                                        PermissionUtils.isManagerOrHigher(
                                            dashboardStore.getCurrentOrganizationRole()
                                        ) &&
                                        PermissionUtils.isHigherRole(
                                            dashboardStore.getCurrentOrganizationRole(),
                                            record.role
                                        )
                                    ) &&
                                        !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole())) ||
                                    (record.role === "owner" && this.hasOnlyOneOwner())
                                }
                            >
                                <Select.Option
                                    value="translator"
                                    disabled={
                                        !PermissionUtils.isHigherRole(
                                            dashboardStore.getCurrentOrganizationRole(),
                                            "translator"
                                        )
                                    }
                                >
                                    Translator
                                </Select.Option>
                                <Select.Option
                                    value="developer"
                                    disabled={
                                        !PermissionUtils.isHigherRole(
                                            dashboardStore.getCurrentOrganizationRole(),
                                            "developer"
                                        )
                                    }
                                >
                                    Developer
                                </Select.Option>
                                <Select.Option
                                    value="manager"
                                    disabled={
                                        !PermissionUtils.isHigherRole(
                                            dashboardStore.getCurrentOrganizationRole(),
                                            "manager"
                                        )
                                    }
                                >
                                    Manager
                                </Select.Option>
                                <Select.Option
                                    value="owner"
                                    disabled={!PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole())}
                                >
                                    Owner
                                </Select.Option>
                            </Select>
                        );
                    }
                },
                {
                    title: "Custom project permissions",
                    key: "projects",
                    render: (_text, record) => {
                        return record.projects.map((projectWrapper) => {
                            const project = projectWrapper.project;
                            const role = projectWrapper.role;

                            return (
                                <Link to={Routes.DASHBOARD.PROJECT.replace(":projectId", project.id)}>
                                    <Tag
                                        style={{ cursor: "pointer" }}
                                        key={project.id}
                                        color={PermissionUtils.getColorByRole(role)}
                                    >
                                        {project.attributes.name}
                                    </Tag>
                                </Link>
                            );
                        });
                    }
                },
                {
                    title: "",
                    key: "actions",
                    width: 80,
                    render: (_text: any, record: IOrganizationUserRow) => {
                        return (
                            <div style={{ display: "flex" }} className="app-table-row-disabled-skip">
                                {record.deactivated_for_organization && (
                                    <div style={{ marginRight: 16 }}>
                                        <Tooltip
                                            title={
                                                dashboardStore.currentOrganization.attributes.max_users_reached
                                                    ? "You have reached the maximum number of users. Please upgrade your plan to activate this user."
                                                    : undefined
                                            }
                                        >
                                            <Popconfirm
                                                title="Do you want to activate this user?"
                                                onConfirm={async () => {
                                                    this.setState({ userActivating: true });
                                                    try {
                                                        // await OrganizationInvitesAPI.delete({
                                                        //     organizationId: invite.attributes.organization_id,
                                                        //     inviteId: invite.id
                                                        // });
                                                        await this.reload();
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                    this.setState({ userActivating: false });
                                                }}
                                                okText="Yes"
                                                cancelText="No"
                                                disabled={
                                                    dashboardStore.currentOrganization.attributes.max_users_reached
                                                }
                                            >
                                                <Button
                                                    type="primary"
                                                    loading={this.state.userActivating}
                                                    disabled={
                                                        dashboardStore.currentOrganization.attributes.max_users_reached
                                                    }
                                                >
                                                    Activate
                                                </Button>
                                            </Popconfirm>
                                        </Tooltip>
                                    </div>
                                )}
                                <Button
                                    style={{ width: "100%" }}
                                    onClick={async () => {
                                        this.setState({
                                            deleteDialogVisible: true
                                        });

                                        Modal.confirm({
                                            title:
                                                record.email === authStore.currentUser.email
                                                    ? "Do you really want to leave this organization?"
                                                    : "Do you really want to remove this user from the organization?",
                                            content: "This cannot be undone.",
                                            okText: "Yes",
                                            okButtonProps: {
                                                danger: true
                                            },
                                            cancelText: "No",
                                            autoFocusButton: "cancel",
                                            visible: this.state.deleteDialogVisible,
                                            onOk: async () => {
                                                const response = await OrganizationMembersAPI.deleteMember(
                                                    this.props.match.params.organizationId,
                                                    record.key
                                                );

                                                if (response.error) {
                                                    if (response.message === "LAST_OWNER_CANT_BE_REMOVED") {
                                                        message.error(
                                                            "The last user with an owner role can't be removed."
                                                        );
                                                    }
                                                } else if (record.email === authStore.currentUser.email) {
                                                    this.props.history.push(Routes.DASHBOARD.ORGANIZATIONS);
                                                } else {
                                                    const getOrganizationUsersResponse =
                                                        await OrganizationMembersAPI.getMembers(
                                                            this.props.match.params.organizationId
                                                        );
                                                    this.setState({
                                                        getOrganizationUsersResponse: getOrganizationUsersResponse,
                                                        deleteDialogVisible: false
                                                    });
                                                }
                                            },
                                            onCancel: () => {
                                                this.setState({
                                                    deleteDialogVisible: false
                                                });
                                            }
                                        });
                                    }}
                                    danger
                                    disabled={
                                        (!(
                                            PermissionUtils.isManagerOrHigher(
                                                dashboardStore.getCurrentOrganizationRole()
                                            ) &&
                                            PermissionUtils.isHigherRole(
                                                dashboardStore.getCurrentOrganizationRole(),
                                                record.role
                                            )
                                        ) &&
                                            !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole()) &&
                                            record.email !== authStore.currentUser.email) ||
                                        this.state.getOrganizationUsersResponse?.data.length === 1
                                    }
                                >
                                    {record.id === authStore.currentUser.id ? "Leave" : "Remove"}
                                </Button>
                            </div>
                        );
                    }
                }
            ]);
        } else if (type === "project") {
            columns = columns.concat([
                {
                    title: "Projects access",
                    key: "projects",
                    render: (_text, record) => {
                        return record.projects.map((projectWrapper) => {
                            const project = projectWrapper.project;
                            const role = projectWrapper.role;

                            return (
                                <Link key={project.id} to={Routes.DASHBOARD.PROJECT.replace(":projectId", project.id)}>
                                    <Tag color={PermissionUtils.getColorByRole(role)}>{project.attributes.name}</Tag>
                                </Link>
                            );
                        });
                    }
                }
            ]);
        }

        return columns;
    };

    getOrganizationInvitesColumns = () => {
        return [
            {
                title: "E-Mail",
                key: "email",
                render: (_text, record) => {
                    return <span style={{ color: "var(--full-color)" }}>{record.email}</span>;
                }
            },
            {
                title: "Role",
                key: "role",
                render: (_text, record) => {
                    return (
                        <Tag color={PermissionUtils.getColorByRole(record.role)}>{Utils.capitalize(record.role)}</Tag>
                    );
                }
            },
            {
                title: "Invited at",
                key: "sentAt",
                render: (_text, record) => {
                    return moment(record.created_at).format("DD.MM.YYYY HH:mm");
                }
            },
            {
                title: "",
                dataIndex: "controls",
                width: 50
            }
        ];
    };

    onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchReloader(event.target.value);
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                    <Breadcrumbs breadcrumbName="organizationMembers" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                        <h1>Users</h1>

                        <Button
                            type="primary"
                            onClick={async () => {
                                this.setState({ inviteDialogOpen: true });
                            }}
                            disabled={!PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentOrganizationRole())}
                            style={{ alignSelf: "flex-start" }}
                            id="invite-user-open"
                        >
                            <UserAddOutlined /> Invite a user
                        </Button>

                        <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
                            <Input.Search
                                placeholder="Search users"
                                onChange={this.onSearch}
                                style={{ maxWidth: 560 }}
                            />

                            <RolesLegend style={{ marginLeft: "auto" }} />
                        </div>

                        <div style={{ marginTop: 40 }}>
                            <h3>Users</h3>
                            <Table
                                dataSource={this.getOrganizationUsersRows()}
                                columns={this.getColumns("organization")}
                                loading={
                                    this.state.loading ||
                                    dashboardStore.currentOrganization.attributes.current_user_deactivated
                                }
                                pagination={false}
                                bordered
                                rowClassName={(row: IOrganizationUserRow) => {
                                    return row.deactivated_for_instance || row.deactivated_for_organization
                                        ? "app-table-row-disabled"
                                        : null;
                                }}
                                locale={{
                                    emptyText: (
                                        <Empty
                                            description={
                                                this.state.search ? "No users for your search found" : "No users found"
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 40 }}>
                            <h3>External users</h3>
                            <Table
                                dataSource={this.getProjectUsersRows()}
                                columns={this.getColumns("project")}
                                loading={
                                    this.state.loading ||
                                    dashboardStore.currentOrganization.attributes.current_user_deactivated
                                }
                                pagination={false}
                                bordered
                                rowClassName={(row: IProjectUserRow) => {
                                    return row.deactivated_for_instance || row.deactivated_for_project
                                        ? "app-table-row-disabled"
                                        : null;
                                }}
                                locale={{
                                    emptyText: (
                                        <Empty
                                            description={
                                                this.state.search ? "No users for your search found" : "No users found"
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    )
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 40 }}>
                            <h3>
                                Invites{" "}
                                <Tooltip title="Users who currently don't have an account. They will automatically be added after they create and confirm their account.">
                                    <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                                </Tooltip>
                            </h3>
                            <Table
                                dataSource={this.getOrganizationInvitesRows()}
                                columns={this.getOrganizationInvitesColumns()}
                                loading={
                                    this.state.loading ||
                                    dashboardStore.currentOrganization.attributes.current_user_deactivated
                                }
                                pagination={false}
                                bordered
                                locale={{
                                    emptyText: (
                                        <Empty description="No invites found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    )
                                }}
                            />
                        </div>
                    </Layout.Content>
                </Layout>

                <InviteUserFormModal
                    organizationId={this.props.match.params.organizationId}
                    visible={this.state.inviteDialogOpen}
                    userRole={dashboardStore.getCurrentOrganizationRole()}
                    onCancelRequest={() => {
                        this.setState({ inviteDialogOpen: false });
                    }}
                    onSuccess={async () => {
                        this.setState({ inviteDialogOpen: false });

                        await this.reload();
                    }}
                />
            </>
        );
    }
}

export { OrganizationMembersSite };
