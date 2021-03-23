import { GithubOutlined } from "@ant-design/icons";
import WhiteLogoWithText from "images/white_logo_with_text.svg";
import * as React from "react";

interface IProps {
    style?: React.CSSProperties;
}

class SiteWrapper extends React.Component<IProps> {
    render() {
        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    justifyContent: "flex-start",
                    alignItems: "center",
                    width: "100%",
                    background: "var(--dark-color)",
                    ...this.props.style
                }}
                className="dark-theme"
            >
                <div style={{ display: "flex", width: "100%", maxWidth: 800, marginTop: 240 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            width: "50%"
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                padding: "24px 40px 0 24px"
                            }}
                        >
                            <img src={WhiteLogoWithText} style={{ maxWidth: 240, marginBottom: 24 }} />
                            <p style={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: "bold" }}>
                                The web-based localization system
                            </p>
                            <p style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                                Texterify is a localization management system that helps you to translate your software
                                efficiently and quickly.
                            </p>

                            <p style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                                You can learn more on{" "}
                                <a href="https://texterify.com" target="_blank">
                                    texterify.com
                                </a>
                                .
                            </p>

                            <p style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                                Make sure to also check out Texterify on{" "}
                                <a
                                    href="https://github.com/texterify/texterify"
                                    target="_blank"
                                    style={{ whiteSpace: "nowrap" }}
                                >
                                    <GithubOutlined style={{ margin: "0 4px" }} /> GitHub
                                </a>
                                .
                            </p>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "24px",
                            flexGrow: 1,
                            width: "50%",
                            border: "1px solid var(--border-color)",
                            borderRadius: 8
                        }}
                    >
                        {this.props.children}
                    </div>
                </div>

                {true && (
                    <div style={{ marginTop: "auto", padding: 24 }}>
                        Copyright © Texterify. All rights reserved.
                        <a
                            href="https://texterify.com/privacy-policy"
                            rel="noopener noreferrer"
                            style={{ marginLeft: 24, marginRight: 16 }}
                            target="_blank"
                        >
                            Privacy policy
                        </a>
                        <a
                            href="https://texterify.com/terms-of-service"
                            rel="noopener noreferrer"
                            style={{ marginRight: 16 }}
                            target="_blank"
                        >
                            Terms of service
                        </a>
                        <a href="https://texterify.com/cookie-settings" rel="noopener noreferrer" target="_blank">
                            Cookie settings
                        </a>
                    </div>
                )}
            </div>
        );
    }
}

export { SiteWrapper };
