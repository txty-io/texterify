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
                    padding: 24,
                    width: "100%",
                    ...this.props.style
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        flexGrow: 1,
                        alignSelf: "center",
                        width: "100%",
                        maxWidth: 320
                    }}
                >
                    <h1 style={{ marginBottom: 24, fontSize: 32, fontFamily: "Ubuntu" }}>texterify</h1>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export { SiteWrapper };
