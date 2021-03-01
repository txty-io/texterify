import { Button, Layout } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Breadcrumbs } from "../../ui/Breadcrumbs";
import VisualStudioCodeLogo from "images/visual_studio_code_logo.svg";
import AppleLogoBlack from "images/apple_logo_black.svg";
import AppleLogoWhite from "images/apple_logo_white.svg";
import AndroidLogo from "images/android_logo.svg";
import { generalStore } from "../../stores/GeneralStore";

@observer
class ProjectIntegrationsSite extends React.Component {
    renderIntegration(options: {
        logo?: JSX.Element;
        textLogo?: string;
        name: string;
        description: string;
        link: string;
    }) {
        return (
            <div
                style={{
                    width: "33%",
                    margin: 24,
                    padding: 40,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    borderRadius: 4,
                    border: "1px solid var(--border-color)",
                    flexGrow: 1,
                    flexBasis: 0,
                    minWidth: 240
                }}
            >
                {options.textLogo && (
                    <div style={{ height: 56, fontSize: 24, color: "var(--full-color)" }}>{options.textLogo}</div>
                )}
                {options.logo && <img src={options.logo} style={{ height: 56 }} />}
                <div
                    style={{
                        fontWeight: "bold",
                        fontSize: 22,
                        marginBottom: 8,
                        marginTop: 16,
                        color: "var(--full-color)"
                    }}
                >
                    {options.name}
                </div>
                <div style={{ opacity: 0.75, fontSize: 14, marginBottom: 16 }}>{options.description}</div>
                <Button
                    type="primary"
                    ghost
                    style={{ marginTop: "auto" }}
                    onClick={() => {
                        window.open(options.link, "_blank");
                    }}
                >
                    Docs
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
                        {this.renderIntegration({
                            textLogo: "CLI",
                            name: "Command Line Interface",
                            description: "Use the command line.",
                            link: "https://github.com/texterify/texterify-cli"
                        })}

                        {this.renderIntegration({
                            textLogo: "API",
                            name: "Application Programming Interface",
                            description: "Use the API.",
                            link: "https://docs.texterify.com/api/basics"
                        })}

                        {this.renderIntegration({
                            logo: VisualStudioCodeLogo,
                            name: "Visual Studio Code",
                            description: "Add and download keys right from your editor.",
                            link: "https://github.com/texterify/texterify-vsc"
                        })}

                        {this.renderIntegration({
                            logo: AndroidLogo,
                            name: "Android SDK",
                            description: "Use Over the Air Translations",
                            link: "https://github.com/texterify/texterify-android"
                        })}

                        {this.renderIntegration({
                            logo: generalStore.theme === "light" ? AppleLogoBlack : AppleLogoWhite,
                            name: "iOS SDK",
                            description: "Use Over the Air Translations",
                            link: "https://github.com/texterify/texterify-ios"
                        })}
                    </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export { ProjectIntegrationsSite };
