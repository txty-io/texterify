import { Button, Collapse, Layout, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { EditUserForm } from "../../forms/EditUserForm";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
const { Content } = Layout;

interface IState {
    loading: boolean;
}

@observer
class UserAccountSettingsSite extends React.Component<{}, IState> {
    state: IState = {
        loading: false
    };

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Account settings</h1>
                    <Collapse bordered={false} defaultActiveKey={["general"]}>
                        <Collapse.Panel header="General settings" key="general">
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
                    </Collapse>
                </Content>
            </Layout>
        );
    }
}

export { UserAccountSettingsSite };
