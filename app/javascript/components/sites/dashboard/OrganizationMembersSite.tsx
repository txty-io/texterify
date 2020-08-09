import { Button, Input, Layout, message, Modal, Select } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { OrganizationMembersAPI } from "../../api/v1/OrganizationMembersAPI";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
import { UserAvatar } from "../../ui/UserAvatar";
import { PermissionUtils } from "../../utilities/PermissionUtils";
const { Content } = Layout;

type IProps = RouteComponentProps<{ organizationId: string }>;
interface IState {
    userAddEmail: string;
    getMembersResponse: any;
    deleteDialogVisible: boolean;
}

@observer
class OrganizationMembersSite extends React.Component<IProps, IState> {
    state: IState = {
        userAddEmail: "",
        getMembersResponse: null,
        deleteDialogVisible: false
    };

    async componentDidMount() {
        await this.reload();
    }

    reload = async () => {
        try {
            const responseGetMembers = await OrganizationMembersAPI.getMembers(this.props.match.params.organizationId);

            this.setState({
                getMembersResponse: responseGetMembers
            });
        } catch (e) {
            console.error(e);
        }
    };

    getRows = () => {
        if (!this.state.getMembersResponse.data) {
            return [];
        }

        return this.state.getMembersResponse.data.map((member: any) => {
            return {
                id: member.id,
                key: member.id,
                username: member.attributes.username,
                email: member.attributes.email,
                roleOrganization: member.attributes.role_organization
            };
        }, []);
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

                    <div style={{ marginTop: 24 }}>
                        {this.getRows().map((item) => {
                            return (
                                <div
                                    key={item.username}
                                    style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
                                >
                                    <div style={{ display: "flex", flexGrow: 1 }}>
                                        <UserAvatar user={item} style={{ marginRight: 24 }} />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <div style={{ fontWeight: "bold" }}>{item.username}</div>
                                            <div>{item.email}</div>
                                        </div>
                                    </div>
                                    <Select
                                        showSearch
                                        placeholder="Select a role"
                                        optionFilterProp="children"
                                        filterOption
                                        style={{ marginRight: 24, width: 240 }}
                                        value={item.roleOrganization}
                                        onChange={async (value: string) => {
                                            try {
                                                const response = await OrganizationMembersAPI.updateMember(
                                                    this.props.match.params.organizationId,
                                                    item.id,
                                                    value
                                                );
                                                await this.reload();
                                                if (!response.errors) {
                                                    message.success("User role updated successfully.");
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                message.error("Error while updating user role.");
                                            }
                                        }}
                                        disabled={
                                            !(
                                                PermissionUtils.isManagerOrHigher(
                                                    dashboardStore.getCurrentOrganizationRole()
                                                ) &&
                                                PermissionUtils.isHigherRole(
                                                    dashboardStore.getCurrentOrganizationRole(),
                                                    item.roleOrganization
                                                )
                                            ) && !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole())
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
                                            disabled={
                                                !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole())
                                            }
                                        >
                                            Owner
                                        </Select.Option>
                                    </Select>
                                    <Button
                                        onClick={async () => {
                                            this.setState({
                                                deleteDialogVisible: true
                                            });

                                            Modal.confirm({
                                                title:
                                                    item.email === authStore.currentUser.email
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
                                                        item.key
                                                    );
                                                    if (item.email === authStore.currentUser.email) {
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
                                                    item.roleOrganization
                                                )
                                            ) &&
                                            !PermissionUtils.isOwner(dashboardStore.getCurrentOrganizationRole()) &&
                                            item.email !== authStore.currentUser.email
                                        }
                                    >
                                        {item.email === authStore.currentUser.email ? "Leave" : "Remove"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </Content>
            </Layout>
        );
    }
}

export { OrganizationMembersSite };
