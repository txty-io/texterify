import { Collapse, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { SettingsSectionWrapper } from "../../../ui/SettingsSectionWrapper";

@observer
class InstanceSettingsSite extends React.Component {
    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
                    <h1>Instance settings</h1>
                    <Collapse bordered={false} defaultActiveKey={["general"]}>
                        <Collapse.Panel header="General settings" key="general">
                            <SettingsSectionWrapper></SettingsSectionWrapper>
                        </Collapse.Panel>
                    </Collapse>
                </Layout.Content>
            </Layout>
        );
    }
}

export { InstanceSettingsSite };
