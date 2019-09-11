import { Layout } from "antd";
import * as React from "react";
import { RouteComponentProps } from "react-router-dom";

type IProps = RouteComponentProps<{ projectId: string }> & {};
interface IState { }

class DashboardSite extends React.Component<IProps, IState> {
  render() {
    return (
      <Layout style={{ padding: "0 24px 24px", maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <Layout.Content style={{ margin: "24px 16px 0", minHeight: 360 }}>
          <h1>Dashboard</h1>
        </Layout.Content>
      </Layout>
    );
  }
}

export { DashboardSite };
