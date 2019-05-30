import { Layout } from "antd";
import * as React from "react";
const { Header, Content, Footer, Sider } = Layout;

class NotFoundSite extends React.Component<{}, {}> {
  render(): JSX.Element {
    return (
      <Layout style={{ padding: "0 24px 24px", maxWidth: 800, margin: "40px auto", width: "100%" }}>
        <p style={{ textAlign: "center", fontSize: 16, color: "rgba(132, 84, 175, .85)" }}>The site could not be found.</p>
        <p style={{ fontSize: 42, marginTop: 16, marginBottom: 16, textAlign: "center", transform: "rotate(90deg)" }}>:(</p>
        <p style={{ textAlign: "center", fontSize: 16, color: "rgba(132, 84, 175, .85)" }}>We are sorry for that.</p>
      </Layout>
    );
  }
}

export { NotFoundSite };
