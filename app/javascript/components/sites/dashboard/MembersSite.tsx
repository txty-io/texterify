import { Button, Input, Layout, message, Modal, Select, Tag, Tooltip, Form } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { MembersAPI } from "../../api/v1/MembersAPI";
import { ProjectsAPI } from "../../api/v1/ProjectsAPI";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
import { UserAvatar } from "../../ui/UserAvatar";
import { PermissionUtils } from "../../utilities/PermissionUtils";
import { FormInstance } from "antd/lib/form";
import { ErrorUtils, ERRORS } from "../../ui/ErrorUtils";

type IProps = RouteComponentProps<{ projectId: string }>;
interface IState {
    userAddEmail: string;
    getMembersResponse: any;
    deleteDialogVisible: boolean;
}

@observer
class MembersSite extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        userAddEmail: "",
        getMembersResponse: null,
        deleteDialogVisible: false
    };

    async componentDidMount() {
        await this.reload();
    }

    reload = async (userId?: string) => {
        try {
            const responseGetMembers = await MembersAPI.getMembers(this.props.match.params.projectId);

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

            this.setState({
                getMembersResponse: responseGetMembers
            });
        } catch (e) {
            console.error(e);
        }
    };

    getRows = (): any[] => {
        return this.state.getMembersResponse.data.map((member: any) => {
            return {
                id: member.id,
                key: member.id,
                username: member.attributes.username,
                email: member.attributes.email,
                role: member.attributes.role,
                roleSource: member.attributes.role_source
            };
        }, []);
    };

    onRemove = async (item: any) => {
        this.setState({
            deleteDialogVisible: true
        });

        Modal.confirm({
            title:
                item.email === authStore.currentUser.email
                    ? "Do you really want to leave this project?"
                    : "Do you really want to remove this user from the project?",
            content: "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            visible: this.state.deleteDialogVisible,
            onOk: async () => {
                const deleteMemberResponse = await MembersAPI.deleteMember(this.props.match.params.projectId, item.key);
                if (item.email === authStore.currentUser.email) {
                    if (!deleteMemberResponse.errors) {
                        this.props.history.push(Routes.DASHBOARD.PROJECTS);
                    }
                } else {
                    const getMembersResponse = await MembersAPI.getMembers(this.props.match.params.projectId);
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
    };

    hasOnlyOneOwner = () => {
        const ownerRows = this.getRows().filter((row) => {
            return PermissionUtils.isOwner(row.role);
        });

        return ownerRows.length === 1;
    };

    render() {
        if (!this.state.getMembersResponse || !this.state.getMembersResponse.data) {
            return <Loading />;
        }

        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%", maxWidth: 1200 }}>
                <Breadcrumbs breadcrumbName="projectMembers" />
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Members</h1>
                    <p>Add users to your project.</p>
                    <div style={{ display: "flex", width: "100%" }}>
                        <Form ref={this.formRef} style={{ width: "100%", maxWidth: 480 }}>
                            <Form.Item name="name">
                                <Input
                                    placeholder="Enter users email address"
                                    onChange={async (event) => {
                                        this.setState({
                                            userAddEmail: event.target.value
                                        });
                                    }}
                                    value={this.state.userAddEmail}
                                    disabled={!PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())}
                                />
                            </Form.Item>
                        </Form>
                        <Button
                            style={{ marginLeft: 8 }}
                            type="primary"
                            onClick={async () => {
                                const createMemberResponse = await MembersAPI.createMember(
                                    this.props.match.params.projectId,
                                    this.state.userAddEmail
                                );

                                if (createMemberResponse.errors) {
                                    this.formRef.current.setFields([
                                        {
                                            name: "name",
                                            errors: [
                                                ErrorUtils.getErrorMessage("user with that email", ERRORS.NOT_FOUND)
                                            ]
                                        }
                                    ]);

                                    return;
                                }

                                this.formRef.current.resetFields();

                                const getMembersResponse = await MembersAPI.getMembers(
                                    this.props.match.params.projectId
                                );

                                this.setState({
                                    getMembersResponse: getMembersResponse,
                                    userAddEmail: ""
                                });
                            }}
                            disabled={
                                this.state.userAddEmail === "" ||
                                !PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())
                            }
                        >
                            Invite
                        </Button>
                    </div>

                    <div style={{ marginTop: 24 }}>
                        {this.getRows().map((item) => {
                            return (
                                <div
                                    key={item.username}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        paddingBottom: 16,
                                        marginBottom: 16,
                                        borderBottom: "1px solid #e8e8e8"
                                    }}
                                >
                                    <div style={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
                                        <UserAvatar user={item} style={{ marginRight: 24 }} />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <div style={{ fontWeight: "bold" }}>{item.username}</div>
                                            <div>{item.email}</div>
                                        </div>
                                    </div>
                                    {item.roleSource === "organization" && (
                                        <Tooltip placement="left" title="Inherited from the organization.">
                                            <Tag color="geekblue">
                                                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                                            </Tag>
                                        </Tooltip>
                                    )}
                                    {item.roleSource !== "organization" && (
                                        <>
                                            <Select
                                                showSearch
                                                placeholder="Select a role"
                                                optionFilterProp="children"
                                                filterOption
                                                style={{ marginRight: 24, width: 240 }}
                                                value={item.role}
                                                onChange={async (value: string) => {
                                                    try {
                                                        const response = await MembersAPI.updateMember(
                                                            this.props.match.params.projectId,
                                                            item.id,
                                                            value
                                                        );
                                                        await this.reload(item.id);
                                                        if (!response.errors) {
                                                            message.success("User role updated successfully.");
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                        message.error("Error while updating user role.");
                                                    }
                                                }}
                                                disabled={
                                                    (!(
                                                        PermissionUtils.isManagerOrHigher(
                                                            dashboardStore.getCurrentRole()
                                                        ) &&
                                                        PermissionUtils.isHigherRole(
                                                            dashboardStore.getCurrentRole(),
                                                            item.role
                                                        )
                                                    ) &&
                                                        !PermissionUtils.isOwner(dashboardStore.getCurrentRole())) ||
                                                    this.getRows().length === 1 ||
                                                    (PermissionUtils.isOwner(item.role) && this.hasOnlyOneOwner())
                                                }
                                            >
                                                <Select.Option
                                                    value="translator"
                                                    disabled={
                                                        !PermissionUtils.isHigherRole(
                                                            dashboardStore.getCurrentRole(),
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
                                                            dashboardStore.getCurrentRole(),
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
                                                            dashboardStore.getCurrentRole(),
                                                            "manager"
                                                        )
                                                    }
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
                                            <Button
                                                onClick={async () => {
                                                    await this.onRemove(item);
                                                }}
                                                danger
                                                disabled={
                                                    item.roleSource === "organization" ||
                                                    (!PermissionUtils.isManagerOrHigher(
                                                        dashboardStore.getCurrentRole()
                                                    ) &&
                                                        !PermissionUtils.isHigherRole(
                                                            dashboardStore.getCurrentRole(),
                                                            item.role
                                                        ) &&
                                                        item.email !== authStore.currentUser.email)
                                                }
                                            >
                                                {item.roleOrganization
                                                    ? "Remove project permission"
                                                    : "Remove from project"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export { MembersSite };
