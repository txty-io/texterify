import { Button, Input, Layout, List, Modal } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { APIUtils } from "../../api/v1/APIUtils";
import { MembersAPI } from "../../api/v1/MembersAPI";
import { Routes } from "../../routing/Routes";
import { authStore } from "../../stores/AuthStore";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { Loading } from "../../ui/Loading";
import { Styles } from "../../ui/Styles";
import { UserAvatar } from "../../ui/UserAvatar";
import { makeCancelable } from "../../utilities/Promise";
const { Content } = Layout;

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState {
  userAddEmail: string;
  getMembersResponse: any;
  deleteDialogVisible: boolean;
}

@observer
class MembersSite extends React.Component<IProps, IState> {
  getMembersPromise: any = null;

  constructor(props: IProps) {
    super(props);

    this.state = {
      userAddEmail: "",
      getMembersResponse: null,
      deleteDialogVisible: false
    };
  }

  async componentDidMount(): Promise<void> {
    try {
      this.getMembersPromise = makeCancelable(MembersAPI.getMembers(this.props.match.params.projectId));
      const responseGetMembers = await this.getMembersPromise.promise;

      this.setState({
        getMembersResponse: responseGetMembers
      });
    } catch (err) {
      if (!err.isCanceled) {
        console.error(err);
      }
    }
  }

  componentWillUnmount() {
    if (this.getMembersPromise !== null) { this.getMembersPromise.cancel(); }
  }

  getRows = (): any[] => {
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

  render(): JSX.Element {
    if (!this.state.getMembersResponse) {
      return <Loading />;
    }

    return (
      <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
        <Breadcrumbs breadcrumbName="members" />
        <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
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

export { MembersSite };
