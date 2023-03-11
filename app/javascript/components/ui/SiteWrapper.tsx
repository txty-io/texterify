import { GithubOutlined } from "@ant-design/icons";
import WhiteLogoWithText from "images/logo_white_text.svg";
import * as React from "react";
import { IS_CLOUD } from "../utilities/Env";

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
                            Make sure to check out Txty on{" "}
                            <a href="https://github.com/txty-io/txty" target="_blank" style={{ whiteSpace: "nowrap" }}>
                                <GithubOutlined style={{ marginRight: 4 }} />
                                GitHub
                            </a>{" "}
                            and{" "}
                            <a href="https://txty.io" target="_blank" style={{ whiteSpace: "nowrap" }}>
                                txty.io
                            </a>
                            .
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: "auto", padding: 24, color: "#fff" }}>
                    Copyright © Txty. All rights reserved.
                    {IS_CLOUD && (
                        <>
                            <a
                                href="https://txty.io/privacy-policy"
                                rel="noopener noreferrer"
                                style={{ marginLeft: 24, marginRight: 16 }}
                                target="_blank"
                            >
                                Privacy policy
                            </a>
                            <a
                                href="https://txty.io/terms-of-service"
                                rel="noopener noreferrer"
                                style={{ marginRight: 16 }}
                                target="_blank"
                            >
                                Terms of service
                            </a>
                            <a href="https://txty.io/cookie-settings" rel="noopener noreferrer" target="_blank">
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
