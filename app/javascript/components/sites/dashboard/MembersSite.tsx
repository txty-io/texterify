import { Button, Input, Layout, message, Modal, Select, Tag } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { MembersAPI } from "../../api/v1/MembersAPI";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { dashboardStore } from "../../stores/DashboardStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
import { UserAvatar } from "../../ui/UserAvatar";
import { PermissionUtils } from "../../utilities/PermissionUtils";

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  userAddEmail: string;
  getMembersResponse: any;
  deleteDialogVisible: boolean;
}

@observer
class MembersSite extends React.Component<IProps, IState> {
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
      const responseGetMembers = await MembersAPI.getMembers(this.props.match.params.projectId);

      this.setState({
        getMembersResponse: responseGetMembers
      });
    } catch (e) {
      console.error(e);
    }
  }

  getRows = (): any[] => {
    return this.state.getMembersResponse.data.map(
      (member: any) => {
        return {
          id: member.id,
          key: member.id,
          username: member.attributes.username,
          email: member.attributes.email,
          role: member.attributes.role,
          role_source: member.attributes.role_source
        };
      },
      []
    );
  }

  onRemove = async (item: any) => {
    this.setState({
      deleteDialogVisible: true
    });

    Modal.confirm({
      title: item.email === authStore.currentUser.email
        ? "Do you really want to leave this project?"
        : "Do you really want to remove this user from the project?",
      content: "This cannot be undone.",
      okText: "Yes",
      okType: "danger",
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
  }

  render() {
    if (!this.state.getMembersResponse || !this.state.getMembersResponse.data) {
      return <Loading />;
    }

    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%", maxWidth: 1200 }}>
        <Breadcrumbs breadcrumbName="projectMembers" />
        <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
          <h1>Members</h1>
          <p>Invite users to your project to help you localize your apps.</p>
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
              disabled={!PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())}
            />
            <Button
              style={{ marginLeft: 8 }}
              type="primary"
              onClick={async () => {
                const createMemberResponse = await MembersAPI.createMember(this.props.match.params.projectId, this.state.userAddEmail);
                if (createMemberResponse.errors) {
                  return;
                }

                const getMembersResponse = await MembersAPI.getMembers(this.props.match.params.projectId);

                this.setState({
                  getMembersResponse: getMembersResponse,
                  userAddEmail: ""
                });
              }}
              disabled={this.state.userAddEmail === "" || !PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())}
            >
              Invite
            </Button>
          </div>

          <div
            style={{ marginTop: 24 }}
          >
            {this.getRows().map((item) => {
              return (
                <div key={item.username} style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", flexGrow: 1, alignItems: "center" }}>
                    <UserAvatar user={item} style={{ marginRight: 24 }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontWeight: "bold" }}>{item.username}</div>
                      <div>{item.email}</div>
                    </div>
                    {item.role_source === "organization" &&
                      <Tag color="geekblue" style={{ marginLeft: 24 }}>{dashboardStore.getOrganizationName()}</Tag>
                    }
                  </div>
                  <Select
                    showSearch
                    placeholder="Select a role"
                    optionFilterProp="children"
                    filterOption
                    style={{ marginRight: 24, width: 240 }}
                    value={item.role}
                    onChange={async (value: string) => {
                      await MembersAPI.updateMember(this.props.match.params.projectId, item.id, value);
                      await this.reload();
                      message.success("User role updated");
                    }}
                    disabled={!PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole())}
                  >
                    <Select.Option value="translator">Übersetzer</Select.Option>
                    <Select.Option value="developer">Entwickler</Select.Option>
                    <Select.Option value="manager">Manager</Select.Option>
                    <Select.Option value="owner">Eigentümer</Select.Option>
                  </Select>
                  <Button
                    onClick={async () => { await this.onRemove(item); }}
                    type="danger"
                    style={{ width: 120 }}
                    disabled={
                      item.role_source === "organization" ||
                      (
                        !PermissionUtils.isManagerOrHigher(dashboardStore.getCurrentRole()) &&
                        item.email !== authStore.currentUser.email
                      )
                    }
                  >
                    {item.email === authStore.currentUser.email ? "Leave" : "Remove"}
                  </Button>
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
