import { GithubOutlined } from "@ant-design/icons";
import WhiteLogoWithText from "images/logo_white_text.svg";
import * as React from "react";
import { IS_TEXTERIFY_CLOUD } from "../utilities/Env";

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
                    background: "var(--color-dark)",
                    ...this.props.style
                }}
                className="dark-theme"
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        width: "100%",
                        maxWidth: 480,
                        flexGrow: 1
                    }}
                >
                    <img
                        src={WhiteLogoWithText}
                        style={{ width: "100%", maxWidth: 280, marginBottom: 64, marginTop: 24 }}
                    />

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            padding: "0 24px 24px",
                            borderRadius: 8,
                            margin: "0 auto",
                            width: "100%"
                        }}
                    >
                        {this.props.children}

                        <p style={{ color: "rgba(255, 255, 255, 0.85)", marginTop: 40 }}>
                            Make sure to check out Texterify on{" "}
                            <a
                                href="https://github.com/texterify/texterify"
                                target="_blank"
                                style={{ whiteSpace: "nowrap" }}
                            >
                                <GithubOutlined style={{ marginRight: 4 }} />
                                GitHub
                            </a>{" "}
                            and{" "}
                            <a href="https://texterify.com" target="_blank" style={{ whiteSpace: "nowrap" }}>
                                texterify.com
                            </a>
                            .
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: "auto", padding: 24, color: "#fff" }}>
                    Copyright © Texterify. All rights reserved.
                    {IS_TEXTERIFY_CLOUD && (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export { SiteWrapper };
