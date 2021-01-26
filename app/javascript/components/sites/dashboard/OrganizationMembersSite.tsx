import { Button, Input, Layout, message, Modal, Select, Table, Tag } from "antd";
import * as _ from "lodash";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { APIUtils } from "../../api/v1/APIUtils";
import { OrganizationMembersAPI } from "../../api/v1/OrganizationMembersAPI";
import { OrganizationsAPI } from "../../api/v1/OrganizationsAPI";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore, IProject } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
import { RolesLegend } from "../../ui/RolesLegend";
import { UserAvatar } from "../../ui/UserAvatar";
import { PermissionUtils } from "../../utilities/PermissionUtils";
const { Content } = Layout;

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    userAddEmail: string;
    getMembersResponse: any;
    getProjectMembersResponse: any;
    deleteDialogVisible: boolean;
    search: string;
    loading: boolean;
}

@observer
class OrganizationMembersSite extends React.Component<IProps, IState> {
    state: IState = {
        userAddEmail: "",
        getMembersResponse: null,
        getProjectMembersResponse: null,
        deleteDialogVisible: false,
        search: "",
        loading: true
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

            this.setState({
                getMembersResponse: responseGetMembers,
                getProjectMembersResponse: responseGetProjectMembers
            });
        } catch (e) {
            console.error(e);
        }

        this.setState({ loading: false });
    };

    getRows = () => {
        if (!this.state.getMembersResponse.data) {
            return [];
        }

        return this.state.getMembersResponse.data.map((user: any) => {
            return {
                id: user.id,
                key: user.id,
                user: user,
                username: user.attributes.username,
                email: user.attributes.email,
                role: user.attributes.role_organization,
                projects: this.state.getProjectMembersResponse.data
                    .filter((projectUser) => {
                        const projectUserUser = APIUtils.getIncludedObject(
                            projectUser.relationships.user.data,
                            this.state.getProjectMembersResponse.included
                        );

                        return user.id === projectUserUser.id;
                    })
                    .map((projectUser) => {
                        const project = APIUtils.getIncludedObject(
                            projectUser.relationships.project.data,
                            this.state.getProjectMembersResponse.included
                        );

                        return {
                            role: projectUser.attributes.role,
                            project: project
                        };
                    })
            };
        }, []);
    };

    getProjectMemberRows = () => {
        if (!this.state.getProjectMembersResponse.data) {
            return [];
        }

        const combined: {
            [key: string]: {
                role: string;
                project: IProject;
            }[];
        } = {};
        this.state.getProjectMembersResponse.data
            .filter((projectUser) => {
                return !this.state.getMembersResponse.data.find((user) => {
                    const projectUserUser = APIUtils.getIncludedObject(
                        projectUser.relationships.user.data,
                        this.state.getProjectMembersResponse.included
                    );

                    return user.id === projectUserUser.id;
                });
            })
            .forEach((projectUser) => {
                const user = APIUtils.getIncludedObject(
                    projectUser.relationships.user.data,
                    this.state.getProjectMembersResponse.included
                );

                const project = APIUtils.getIncludedObject(
                    projectUser.relationships.project.data,
                    this.state.getProjectMembersResponse.included
                );

                if (!combined[user.id]) {
                    combined[user.id] = [];
                }

                combined[user.id].push({
                    role: projectUser.attributes.role,
                    project: project
                });
            });

        const result = [];
        for (const [key, value] of Object.entries(combined)) {
            result.push({
                id: key,
                key: key,
                user: this.state.getProjectMembersResponse.included.find((included) => {
                    return included.type === "user" && included.id === key;
                }),
                projects: value
            });
        }

        return result;
    };

    hasOnlyOneOwner = () => {
        const ownerRows = this.getRows().filter((row) => {
            return PermissionUtils.isOwner(row.role);
        });

        return ownerRows.length === 1;
    };

    getColumns = (type: "organization" | "project") => {
        let columns = [
            {
                title: "",
                key: "image",
                width: 80,
                render: (_text, record) => {
                    return <UserAvatar user={record.user.attributes} style={{ marginRight: 24 }} />;
                }
            },
            {
                title: "Username",
                key: "username",
                render: (_text, record) => {
                    return (
                        <span style={{ color: "var(--full-color)", fontWeight: "bold" }}>
                            {record.user.attributes.username}
                        </span>
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
                    render: (_text, record) => {
                        return (
                            <Select
                                showSearch
                                placeholder="Select a role"
                                optionFilterProp="children"
                                filterOption
                                style={{ marginRight: 24, width: 240 }}
                                value={record.role}
                                onChange={async (value: string) => {
                                    try {
                                        const response = await OrganizationMembersAPI.updateMember(
                                            this.props.match.params.organizationId,
                                            record.id,
                                            value
                                        );

                                        if (!response.errors) {
                                            message.success("User role updated successfully.");
                                        }

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
                    render: (_text: any, record: any) => {
                        return (
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
                                            const deleteMemberResponse = await OrganizationMembersAPI.deleteMember(
                                                this.props.match.params.organizationId,
                                                record.key
                                            );
                                            if (record.email === authStore.currentUser.email) {
                                                if (!deleteMemberResponse.errors) {
                                                    this.props.history.push(Routes.DASHBOARD.ORGANIZATIONS);
                                                }
                                            } else {
                                                const getMembersResponse = await OrganizationMembersAPI.getMembers(
                                                    this.props.match.params.organizationId
                                                );
                                                this.setState({
                                                    getMembersResponse: getMembersResponse,
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
                                    !(
                                        PermissionUtils.isManagerOrHigher(
                                            dashboardStore.getCurrentOrganizationRole()
                                        ) &&
                                        PermissionUtils.isHigherRole(
                                            dashboardStore.getCurrentOrganizationRole(),
                                            record.role
                                        )
                                    ) &&
                                    !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole()) &&
                                    record.email !== authStore.currentUser.email
                                }
                            >
                                {record.id === authStore.currentUser.id ? "Leave" : "Remove"}
                            </Button>
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
                                <Tag key={project.id} color={PermissionUtils.getColorByRole(role)}>
                                    {project.attributes.name}
                                </Tag>
                            );
                        });
                    }
                }
            ]);
        }

        return columns;
    };

    onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.debouncedSearchReloader(event.target.value);
    };

    render() {
        if (!this.state.getMembersResponse) {
            return <Loading />;
        }

        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="organizationMembers" />
                <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Members</h1>
                    <p>Invite users to your organization to help you localize your apps.</p>
                    <div style={{ display: "flex" }}>
                        <Input
                            placeholder="Enter users email address"
                            onChange={async (event) => {
                                this.setState({
                                    userAddEmail: event.target.value
                                });
                            }}
                            value={this.state.userAddEmail}
                            style={{ maxWidth: 400 }}
                            disabled={!PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentOrganizationRole())}
                        />
                        <Button
                            style={{ marginLeft: 8 }}
                            type="primary"
                            onClick={async () => {
                                const createMemberResponse = await OrganizationMembersAPI.createMember(
                                    this.props.match.params.organizationId,
                                    this.state.userAddEmail
                                );
                                if (createMemberResponse.errors) {
                                    return;
                                }

                                const getMembersResponse = await OrganizationMembersAPI.getMembers(
                                    this.props.match.params.organizationId
                                );

                                this.setState({
                                    getMembersResponse: getMembersResponse,
                                    userAddEmail: ""
                                });
                            }}
                            disabled={this.state.userAddEmail === ""}
                        >
                            Invite
                        </Button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", marginTop: 24 }}>
                        <Input.Search placeholder="Search users" onChange={this.onSearch} style={{ maxWidth: "50%" }} />

                        <RolesLegend style={{ marginLeft: "auto" }} />
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3>Organization users</h3>
                        <Table
                            dataSource={this.getRows()}
                            columns={this.getColumns("organization")}
                            loading={this.state.loading}
                            size="middle"
                            pagination={false}
                        />
                    </div>

                    <div style={{ marginTop: 40 }}>
                        <h3>External users</h3>
                        <Table
                            dataSource={this.getProjectMemberRows()}
                            columns={this.getColumns("project")}
                            loading={this.state.loading}
                            size="middle"
                            pagination={false}
                        />
                    </div>
                </Content>
            </Layout>
        );
    }
}

export { OrganizationMembersSite };
