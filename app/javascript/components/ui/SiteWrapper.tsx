import * as React from "react";
import GitHubMarkLight from "images/GitHub-Mark-Light-120px-plus.png";
import { WhiteButton } from "./WhiteButton";
import { DarkModeToggle } from "./DarkModeToggle";
import Logo from "images/logo.svg";

interface IProps {
    style?: React.CSSProperties;
}

class SiteWrapper extends React.Component<IProps> {
    render() {
        return (
            <div
                style={{
                    display: "flex",
                    flexGrow: 1,
                    width: "100%",
                    ...this.props.style
                }}
            >
                <div
                    style={{
                        background: "var(--dark-color)",
                        width: "50%",
                        minHeight: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: "#fff"
                    }}
                >
                    <div
                        style={{
                            maxWidth: 400,
                            margin: "auto",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            padding: 40
                        }}
                    >
                        <h1
                            style={{
                                marginBottom: 24,
                                fontSize: 48,
                                fontFamily: "Ubuntu",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <img src={Logo} style={{ maxWidth: 120, marginRight: 16 }} />
                            texterify
                        </h1>
                        <p style={{ marginBottom: 40 }}>
                            Texterify is an open-source localization management system that helps you translating your
                            apps and websites.
                        </p>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <img src={GitHubMarkLight} style={{ maxWidth: 32, marginRight: 40 }} />
                            <WhiteButton
                                onClick={() => {
                                    window.open("https://github.com/chrztoph/texterify", "_blank", "noopener");
                                }}
                            >
                                Show on GitHub
                            </WhiteButton>
                        </div>
                        <div style={{ marginTop: 40 }}>
                            <DarkModeToggle text="Toggle light/dark theme" disableTooltip style={{ marginLeft: 16 }} />
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        flexGrow: 1,
                        alignSelf: "center",
                        width: "50%",
                        padding: 40
                    }}
                >
                    <div style={{ maxWidth: 360, margin: "0 auto", width: "100%" }}>{this.props.children}</div>
                </div>
            </div>
        );
    }
}

export { SiteWrapper };
