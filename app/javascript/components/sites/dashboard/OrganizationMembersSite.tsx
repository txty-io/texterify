import { Button, Input, Layout, Modal } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { OrganizationMembersAPI } from "../../api/v1/OrganizationMembersAPI";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
import { UserAvatar } from "../../ui/UserAvatar";
const { Content } = Layout;

type IProps = RouteComponentProps<{ organizationId: string }> & {};
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
    try {
      const responseGetMembers = await OrganizationMembersAPI.getMembers(this.props.match.params.organizationId);

      this.setState({
        getMembersResponse: responseGetMembers
      });
    } catch (error) {
      console.error(error);
    }
  }

  getRows = () => {
    if (!this.state.getMembersResponse.data) {
      return [];
    }

    return this.state.getMembersResponse.data.map(
      (member: any) => {
        return {
          id: member.id,
          key: member.id,
          username: member.attributes.username,
          email: member.attributes.email
        };
      },
      []
    );
  }

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
            />
            <Button
              style={{ marginLeft: 8 }}
              type="primary"
              onClick={async () => {
                const createMemberResponse = await OrganizationMembersAPI.createMember(this.props.match.params.organizationId, this.state.userAddEmail);
                if (createMemberResponse.errors) {
                  return;
                }

                const getMembersResponse = await OrganizationMembersAPI.getMembers(this.props.match.params.organizationId);

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

          <div
            style={{ marginTop: 24 }}
          >
            {this.getRows().map((item) => {
              return (
                <div key={item.username} style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", flexGrow: 1 }}>
                    <UserAvatar user={item} style={{ marginRight: 24 }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontWeight: "bold" }}>{item.username}</div>
                      <div>{item.email}</div>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      this.setState({
                        deleteDialogVisible: true
                      });

                      Modal.confirm({
                        title: item.email === authStore.currentUser.email
                          ? "Do you really want to leave this organization?"
                          : "Do you really want to remove this user from the organization?",
                        content: "This cannot be undone.",
                        okText: "Yes",
                        okType: "danger",
                        cancelText: "No",
                        visible: this.state.deleteDialogVisible,
                        onOk: async () => {
                          const deleteMemberResponse = await OrganizationMembersAPI.deleteMember(this.props.match.params.organizationId, item.key);
                          if (item.email === authStore.currentUser.email) {
                            if (!deleteMemberResponse.errors) {
                              this.props.history.push(Routes.DASHBOARD.ORGANIZATIONS);
                            }
                          } else {
                            const getMembersResponse = await OrganizationMembersAPI.getMembers(this.props.match.params.organizationId);
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
                    type="danger"
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
