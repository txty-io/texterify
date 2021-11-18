import { QuestionCircleOutlined, UserAddOutlined } from "@ant-design/icons";
import { Button, Input, Layout, message, Modal, Select, Table, Tag, Tooltip } from "antd";
import { FormInstance } from "antd/lib/form";
import * as _ from "lodash";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { MembersAPI } from "../../api/v1/MembersAPI";
import { IGetUsersResponse, IUserRoleSource } from "../../api/v1/OrganizationMembersAPI";
import { IGetProjectInvitesResponse, ProjectInvitesAPI } from "../../api/v1/ProjectInvitesAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { InviteUserFormModal } from "../../forms/InviteUserFormModal";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore } from "../../stores/DashboardStore";
import { IUserRole } from "../../types/IUserRole";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ErrorUtils } from "../../ui/ErrorUtils";
import { ProjectInvitesTable } from "../../ui/ProjectInvitesTable";
import { RolesLegend } from "../../ui/RolesLegend";
import { UserAvatar } from "../../ui/UserAvatar";
import { PermissionUtils } from "../../utilities/PermissionUtils";

interface IUserRow {
    id: string;
    key: string;
    username: string;
    email: string;
    role: IUserRole;
    roleSource: IUserRoleSource;
    deactivated_for_project: boolean;
    deactivated_for_instance: boolean;
}

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    getUsersResponse: IGetUsersResponse;
    getProjectInvitesResponse: IGetProjectInvitesResponse;
    deleteDialogVisible: boolean;
    loading: boolean;
    search: string;
    inviteDialogOpen: boolean;
    inviteRole: string;
}

@observer
class MembersSite extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        getUsersResponse: null,
        getProjectInvitesResponse: null,
        deleteDialogVisible: false,
        loading: true,
        search: "",
        inviteDialogOpen: false,
        inviteRole: "translator"
    };

    debouncedSearchReloader = _.debounce(
        async (value) => {
            this.setState({ search: value });
            await this.reload(null, { search: value });
        },
        500,
        { trailing: true }
    );

    async componentDidMount() {
        await this.reload();
    }

    reload = async (userId?: string, options?: { search?: string }) => {
        this.setState({ loading: true });

        const fetchOptions = options || ({} as any);
        fetchOptions.search = (options && options.search) || this.state.search;

        try {
            const responseGetMembers = await MembersAPI.getMembers(this.props.match.params.projectId, fetchOptions);

            // If the current users permission changed we reload the current project.
            if (userId === authStore.currentUser.id) {
                const getProjectResponse = await ProjectsAPI.getProject(this.props.match.params.projectId);
                if (getProjectResponse.errors) {
                    this.props.history.push(Routes.DASHBOARD.PROJECTS);
                } else {
                    dashboardStore.currentProject = getProjectResponse.data;
                    dashboardStore.currentProjectIncluded = getProjectResponse.included;
                }
            }

            const responseGetProjectInvites = await ProjectInvitesAPI.getAll({
                projectId: this.props.match.params.projectId
            });

            this.setState({
                getUsersResponse: responseGetMembers,
                getProjectInvitesResponse: responseGetProjectInvites
            });
        } catch (e) {
            console.error(e);
        }

        this.setState({ loading: false });
    };

    getRows = () => {
        return (
            this.state.getUsersResponse?.data?.map((user) => {
                return {
                    id: user.id,
                    key: user.id,
                    username: user.attributes.username,
                    email: user.attributes.email,
                    role: user.attributes.role,
                    roleSource: user.attributes.role_source,
                    deactivated_for_project: user.attributes.user_deactivated_for_project,
                    deactivated_for_instance: user.attributes.deactivated
                };
            }, []) || []
        );
    };

    getOrganizationRows = () => {
        return this.getRows().filter((member) => {
            return member.roleSource === "organization";
        });
    };

    getProjectRows = () => {
        return this.getRows().filter((member) => {
            return member.roleSource === "project";
        });
    };

    onRemove = async (item: any) => {
        this.setState({
            deleteDialogVisible: true
        });

        Modal.confirm({
            title:
                item.id === authStore.currentUser.id
                    ? "Do you really want to leave this project?"
                    : "Do you really want to remove this user from the project?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            visible: this.state.deleteDialogVisible,
            onOk: async () => {
                try {
                    const deleteMemberResponse = await MembersAPI.deleteMember(
                        this.props.match.params.projectId,
                        item.key
                    );

                    if (item.email === authStore.currentUser.email) {
                        if (!deleteMemberResponse.errors) {
                            this.props.history.push(Routes.DASHBOARD.PROJECTS);
                        }
                    } else {
                        const getUsersResponse = await MembersAPI.getMembers(this.props.match.params.projectId);
                        this.setState({
                            getUsersResponse: getUsersResponse,
                            deleteDialogVisible: false
                        });
                    }
                } catch (error) {
                    message.error("Failed to remove user.");
                }
            },
            onCancel: () => {
                this.setState({
                    deleteDialogVisible: false
                });
            }
        });
    };

    hasOnlyOneOwner = () => {
        const ownerRows = this.getRows().filter((row) => {
            return PermissionUtils.isOwner(row.role);
        });

        return ownerRows.length === 1;
    };

    getColumns = () => {
        return [
            {
                title: "",
                key: "image",
                width: 80,
                render: (_text, record) => {
                    return <UserAvatar user={record} />;
                }
            },
            {
                title: "Username",
                key: "username",
                render: (_text, record: IUserRow) => {
                    return (
                        <>
                            <span style={{ color: "var(--full-color)", fontWeight: "bold" }}>{record.username}</span>
                            {record.deactivated_for_project && (
                                <Tooltip title="User has been deactivated for this organization. Go to your organization users site to activate this user.">
                                    <Tag
                                        className="texterify-table-row-disabled-skip"
                                        style={{ marginLeft: 24 }}
                                        color="red"
                                    >
                                        Deactivated
                                    </Tag>
                                </Tooltip>
                            )}
                            {record.deactivated_for_instance && (
                                <Tooltip title="User account has been deactivated.">
                                    <Tag
                                        className="texterify-table-row-disabled-skip"
                                        style={{ marginLeft: 24 }}
                                        color="red"
                                    >
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
                    return <span style={{ color: "var(--full-color)" }}>{record.email}</span>;
                }
            },
            {
                title: "Role",
                key: "role",
                render: (_text, record) => {
                    if (record.roleSource === "organization") {
                        return (
                            <Tooltip placement="left" title="Inherited from the organization.">
                                <Tag color={PermissionUtils.getColorByRole(record.role)}>
                                    {record.role.charAt(0).toUpperCase() + record.role.slice(1)}
                                </Tag>
                            </Tooltip>
                        );
                    }

                    return (
                        <Select
                            showSearch
                            placeholder="Select a role"
                            optionFilterProp="children"
                            filterOption
                            style={{ marginRight: 24, width: 240 }}
                            value={record.role}
                            onChange={async (value: IUserRole) => {
                                try {
                                    const response = await MembersAPI.updateMember(
                                        this.props.match.params.projectId,
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
                                        } else if (response.message === "LAST_OWNER_CANT_BE_REMOVED") {
                                            message.error("The last user with an owner role can't be removed.");
                                        }
                                    } else {
                                        await this.reload(record.id);
                                        if (!response.errors) {
                                            message.success("User role updated successfully.");
                                        }
                                    }
                                } catch (e) {
                                    console.error(e);
                                    message.error("Error while updating user role.");
                                }
                            }}
                            disabled={
                                (!(
                                    PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole()) &&
                                    PermissionUtils.isHigherRole(dashboardStore.getCurrentRole(), record.role)
                                ) &&
                                    !PermissionUtils.isOwner(dashboardStore.getCurrentRole())) ||
                                this.getRows().length === 1 ||
                                (PermissionUtils.isOwner(record.role) && this.hasOnlyOneOwner())
                            }
                        >
                            <Select.Option
                                value="translator"
                                disabled={!PermissionUtils.isHigherRole(dashboardStore.getCurrentRole(), "translator")}
                            >
                                Translator
                            </Select.Option>
                            <Select.Option
                                value="developer"
                                disabled={!PermissionUtils.isHigherRole(dashboardStore.getCurrentRole(), "developer")}
                            >
                                Developer
                            </Select.Option>
                            <Select.Option
                                value="manager"
                                disabled={!PermissionUtils.isHigherRole(dashboardStore.getCurrentRole(), "manager")}
                            >
                                Manager
                            </Select.Option>
                            <Select.Option
                                value="owner"
                                disabled={!PermissionUtils.isOwner(dashboardStore.getCurrentRole())}
                            >
                                Owner
                            </Select.Option>
                        </Select>
                    );
                }
            },
            {
                title: "",
                key: "actions",
                width: 80,
                render: (_text: any, record: any) => {
                    if (record.roleSource !== "organization") {
                        return (
                            <>
                                <Button
                                    style={{ width: "100%" }}
                                    onClick={async () => {
                                        await this.onRemove(record);
                                    }}
                                    danger
                                    disabled={
                                        (!PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole()) &&
                                            !PermissionUtils.isHigherRole(
                                                dashboardStore.getCurrentRole(),
                                                record.role
                                            ) &&
                                            record.email !== authStore.currentUser.email) ||
                                        this.state.getUsersResponse?.data.length === 1
                                    }
                                >
                                    {record.id === authStore.currentUser.id ? "Leave" : "Remove"}
                                </Button>
                            </>
                        );
                    }
                }
            }
        ];
    };

    onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchReloader(event.target.value);
    };

    render() {
        return (
            <>
                <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%", maxWidth: 1200 }}>
                    <Breadcrumbs breadcrumbName="projectMembers" />
                    <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                        <h1>Users</h1>

                        <Button
                            type="primary"
                            onClick={async () => {
                                this.setState({ inviteDialogOpen: true });
                            }}
                            disabled={!PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())}
                            style={{ alignSelf: "flex-start" }}
                            id="invite-user-open"
                        >
                            <UserAddOutlined /> Invite a user
                        </Button>

                        <div style={{ display: "flex", alignItems: "center", marginTop: 16 }}>
                            <Input.Search
                                allowClear
                                placeholder="Search users"
                                onChange={this.onSearch}
                                style={{ maxWidth: "50%" }}
                            />

                            <RolesLegend style={{ marginLeft: "auto" }} />
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <h3>Project users</h3>
                            <Table
                                dataSource={this.getProjectRows()}
                                columns={this.getColumns()}
                                loading={
                                    this.state.loading ||
                                    dashboardStore.currentProject.attributes.current_user_deactivated
                                }
                                pagination={false}
                                bordered
                                rowClassName={(row: IUserRow) => {
                                    return row.deactivated_for_instance || row.deactivated_for_project
                                        ? "texterify-table-row-disabled"
                                        : null;
                                }}
                            />
                        </div>

                        <div style={{ marginTop: 40 }}>
                            <h3>Users from organization</h3>
                            <Table
                                dataSource={this.getOrganizationRows()}
                                columns={this.getColumns()}
                                loading={
                                    this.state.loading ||
                                    dashboardStore.currentProject.attributes.current_user_deactivated
                                }
                                pagination={false}
                                bordered
                                // rowClassName={(row: IUserRow) => {
                                //     return row.deactivated_for_instance || row.deactivated_for_organization
                                //         ? "texterify-table-row-disabled"
                                //         : null;
                                // }}
                            />
                        </div>

                        <div style={{ marginTop: 40 }}>
                            <h3>
                                Invites{" "}
                                <Tooltip title="Users who currently don't have an account. They will automatically be added after they create and confirm their account.">
                                    <QuestionCircleOutlined style={{ marginLeft: 8 }} />
                                </Tooltip>
                            </h3>
                            <ProjectInvitesTable
                                loading={
                                    this.state.loading ||
                                    dashboardStore.currentProject.attributes.current_user_deactivated
                                }
                                projectInvites={this.state.getProjectInvitesResponse?.data || []}
                                onDelete={async () => {
                                    await this.reload();
                                }}
                            />
                        </div>
                    </Layout.Content>
                </Layout>

                <InviteUserFormModal
                    projectId={this.props.match.params.projectId}
                    visible={this.state.inviteDialogOpen}
                    userRole={dashboardStore.getCurrentRole()}
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

export { MembersSite };
