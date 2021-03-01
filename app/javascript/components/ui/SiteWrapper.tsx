import * as React from "react";
import { WhiteButton } from "./WhiteButton";
import { DarkModeToggle } from "./DarkModeToggle";
import WhiteLogoWithText from "images/white_logo_with_text.svg";

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
                        <img src={WhiteLogoWithText} style={{ maxWidth: 240, marginBottom: 24 }} />
                        <p style={{ marginBottom: 40 }}>
                            Texterify is a localization management system that helps you to translate your software
                            efficient and fast.
                        </p>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <WhiteButton
                                onClick={() => {
                                    window.open(
                                        "https://github.com/texterify/texterify",
                                        "_blank",
                                        "noopener noreferrer"
                                    );
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
