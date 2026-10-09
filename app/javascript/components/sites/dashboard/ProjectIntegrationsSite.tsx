import { Button, Layout, List } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { RouteComponentProps } from "react-router";
import { history } from "../../routing/history";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import { ListContent } from "../../ui/ListContent";

interface IIntegration {
    key: string;
    textLogo: string;
    name: string;
    description: string;
    link: string;
    logo?: string;
    hasSubpage?: boolean;
    buttonText?: boolean;
}

type IProps = RouteComponentProps<{ projectId: string }>;

@observer
class ProjectIntegrationsSite extends React.Component<IProps> {
    openIntegration(integration: IIntegration) {
        if (integration.hasSubpage) {
            history.push(integration.link);
        } else {
            window.open(integration.link, "_blank");
        }
    }

    renderIntegration(integration: IIntegration) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center"
                }}
            >
                {integration.textLogo && (
                    <div style={{ width: 40, fontSize: 24, color: "var(--full-color)", textAlign: "center" }}>
                        {integration.textLogo}
                    </div>
                )}
                {integration.logo && <img src={integration.logo} style={{ width: 40 }} />}
                <div style={{ display: "flex", flexDirection: "column", margin: "0 40px", width: 560 }}>
                    <div
                        style={{
                            fontWeight: "bold",
                            fontSize: 18,
                            color: "var(--full-color)"
                        }}
                    >
                        {integration.name}
                    </div>
                    <div style={{ opacity: 0.75, fontSize: 14 }}>{integration.description}</div>
                </div>
                <Button
                    type="primary"
                    ghost
                    onClick={() => {
                        this.openIntegration(integration);
                    }}
                >
                    {integration.buttonText ? integration.buttonText : "Documentation"}
                </Button>
            </div>
        );
    }

    render() {
        return (
            <Layout style={{ padding: "0 24px 24px", margin: "0", width: "100%" }}>
                <Breadcrumbs breadcrumbName="projectIntegrations" />
                <Layout.Content
                    style={{ margin: "24px 16px 0", minHeight: 360, display: "flex", flexDirection: "column" }}
                >
                    <h1>Integrations</h1>

                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <List
                            size="default"
                            dataSource={[
                                {
                                    key: "cli",
                                    textLogo: "CLI",
                                    name: "CLI Tool",
                                    description: "Manage your translations directly from the command line.",
                                    link: "https://github.com/texterify/texterify-cli"
                                }
                            ].sort((a, b) => {
                                return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
                            })}
                            style={{ flexGrow: 1 }}
                            renderItem={(item) => {
                                return (
                                    <List.Item key={item.key} data-id={`project-${item.key}`}>
                                        <List.Item.Meta
                                            style={{ overflow: "hidden" }}
                                            title={
                                                <ListContent
                                                    onClick={() => {
                                                        this.openIntegration(item);
                                                    }}
                                                    role="button"
                                                >
                                                    {this.renderIntegration(item)}
                                                </ListContent>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectIntegrationsSite };
