import { Button, Collapse, Layout, Modal, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { EditUserForm } from "../../forms/EditUserForm";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
import { UsersAPI } from "../../api/v1/UsersAPI";
import { history } from "../../routing/history";
import { Routes } from "../../routing/Routes";
import { IS_TEXTERIFY_CLOUD } from "../../utilities/Env";
const { Content } = Layout;

interface IState {
    loading: boolean;
    deleteAccountLoading: boolean;
}

@observer
class UserAccountSettingsSite extends React.Component<{}, IState> {
    state: IState = {
        loading: false,
        deleteAccountLoading: false
    };

    onDeleteAccount = async () => {
        this.setState({ deleteAccountLoading: true });

        Modal.confirm({
            title: "Do you really want to delete your account?",
            content: IS_TEXTERIFY_CLOUD
                ? "This cannot be undone. Subscriptions for organization where you are the only owner are automatically canceled."
                : "This cannot be undone.",
            okText: "Yes",
            okButtonProps: {
                danger: true
            },
            cancelText: "No",
            autoFocusButton: "cancel",
            onOk: async () => {
                try {
                    await UsersAPI.deleteAccount();
                    message.success("Successfully deleted account.");
                    history.push(Routes.AUTH.LOGIN);
                } catch (error) {
                    console.error(error);
                    message.error("Error while deleting your account.");
                } finally {
                    this.setState({ deleteAccountLoading: false });
                }
            },
            onCancel: () => {
                this.setState({ deleteAccountLoading: false });
            }
        });
    };

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Account settings</h1>
                    <Collapse bordered={false}>
                        <Collapse.Panel header="General" key="general">
                            <SettingsSectionWrapper>
                                <EditUserForm
                                    onCreated={() => {
                                        message.success("Successfully updated account settings.");
                                        this.setState({ loading: false });
                                    }}
                                    onError={() => {
                                        this.setState({ loading: false });
                                    }}
                                />
                                <Button
                                    form="editUserForm"
                                    type="primary"
                                    htmlType="submit"
                                    style={{ alignSelf: "flex-end" }}
                                    loading={this.state.loading}
                                    onClick={() => {
                                        this.setState({ loading: true });
                                    }}
                                >
                                    Save
                                </Button>
                            </SettingsSectionWrapper>
                        </Collapse.Panel>
                        <Collapse.Panel header="Delete account" key="deleteAccount">
                            <SettingsSectionWrapper>
                                <Button loading={this.state.deleteAccountLoading} danger onClick={this.onDeleteAccount}>
                                    Delete account
                                </Button>
                            </SettingsSectionWrapper>
                        </Collapse.Panel>
                    </Collapse>
                </Content>
            </Layout>
        );
    }
}

export { UserAccountSettingsSite };
