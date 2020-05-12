import * as React from "react";
import GitHubMarkLight from "images/GitHub-Mark-Light-120px-plus.png";
import { WhiteButton } from "./WhiteButton";

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
                        background: "#000",
                        width: "50%",
                        height: "100%",
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
                        <h1 style={{ marginBottom: 24, fontSize: 48, fontFamily: "Ubuntu", color: "#fff" }}>
                            texterify
                        </h1>
                        <p style={{ marginBottom: 40 }}>
                            Texterify is an open-source localization management system that helps you translating your
                            apps and websites.
                        </p>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <img src={GitHubMarkLight} style={{ maxWidth: 56, marginRight: 40 }} />
                            <WhiteButton>Show on GitHub</WhiteButton>
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
