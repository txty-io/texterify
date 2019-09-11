import { Button, Collapse, Layout, message } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { EditUserForm } from "../../forms/EditUserForm";
import { SettingsSectionWrapper } from "../../ui/SettingsSectionWrapper";
const { Content } = Layout;

interface IProps { }
interface IState { }

@observer
class UserAccountSettingsSite extends React.Component<IProps, IState> {
  render() {
    return (
      <Layout style={{ padding: "0 24px 24px", maxWidth: 550, margin: "0", width: "100%" }}>
        <Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
          <h1>Account settings</h1>
          <Collapse bordered={false} defaultActiveKey={["general"]}>
            <Collapse.Panel header="General settings" key="general">
              <SettingsSectionWrapper>
                <EditUserForm
                  onCreated={() => {
                    message.success("Successfully updated account settings.");
                  }}
                  onError={(errors: any) => {
                    message.error("Error while updating account settings.");
                  }}
                />
                <Button form="editUserForm" type="primary" htmlType="submit" style={{ alignSelf: "flex-end" }}>
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
