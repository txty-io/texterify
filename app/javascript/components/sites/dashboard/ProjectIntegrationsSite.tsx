import { Button, Layout, List } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import VisualStudioCodeLogo from "images/visual_studio_code_logo.svg";
import AppleLogoBlack from "images/apple_logo_black.svg";
import AppleLogoWhite from "images/apple_logo_white.svg";
import AndroidLogo from "images/android_logo.svg";
import WordpressLogo from "images/wordpress_logo.svg";
import { generalStore } from "../../stores/GeneralStore";
import { ListContent } from "../../ui/ListContent";
import { Routes } from "../../routing/Routes";
import { RouteComponentProps } from "react-router";
import { history } from "../../routing/history";
import {
    AdjustmentsHorizontalIcon,
    Bars4Icon,
    CheckBadgeIcon,
    CloudIcon,
    Cog6ToothIcon,
    HomeIcon,
    LanguageIcon,
    PencilIcon,
    TagIcon,
    UsersIcon
} from "@heroicons/react/24/outline";
import { t } from "../../i18n/Util";
import { BlockOutlined } from "@ant-design/icons";
import { SiteHeader } from "../../ui/SiteHeader";

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
    getIntegrations() {
        return [
            {
                key: "cli",
                textLogo: "CLI",
                name: "CLI Tool",
                description: "Manage your translations directly from the command line.",
                link: "https://github.com/texterify/texterify-cli"
            },
            /* {this.renderIntegration({
            textLogo: "API",
            name: "Application Programming Interface",
            description: "Use the API.",
            link: "https://docs.texterify.com/api/basics"
        })} */
            {
                key: "vsc",
                logo: VisualStudioCodeLogo,
                name: "Visual Studio Code Extension",
                description: "Add and download translations right from your editor.",
                link: "https://github.com/texterify/texterify-vsc"
            },
            {
                key: "android",
                logo: AndroidLogo,
                name: "Android SDK",
                description: "Use the Over the Air SDK to update the translations in your apps in real-time.",
                link: "https://github.com/texterify/texterify-android"
            },
            {
                key: "ios",
                logo: generalStore.theme === "light" ? AppleLogoBlack : AppleLogoWhite,
                name: "iOS SDK",
                description: "Use the Over the Air SDK to update the translations in your apps in real-time.",
                link: "https://github.com/texterify/texterify-ios"
            },
            {
                key: "wordpress",
                logo: WordpressLogo,
                name: "WordPress",
                description: "Synchonize content between Texterify and WordPress with ease.",
                link: Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS_RESOLVER({
                    projectId: this.props.match.params.projectId
                }),
                hasSubpage: true,
                buttonText: "Settings"
            }
        ] as IIntegration[];
    }

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
                    <SiteHeader icon={<BlockOutlined />} title={t("component.integrations_site.title")} />

                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                        <List
                            size="default"
                            dataSource={this.getIntegrations().sort((a, b) => {
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
