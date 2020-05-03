import * as React from "react";
import { LoadingOutlined } from "@ant-design/icons";

interface IProps {
    isVisible: boolean;
    loadingText: string;
}

class LoadingOverlay extends React.Component<IProps> {
    componentWillUnmount(): void {
        document.body.style.overflow = "";
    }

    render() {
        if (this.props.isVisible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return (
            <>
                {this.props.isVisible && (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            background: "rgba(0, 0, 0, .75)",
                            position: "fixed",
                            top: 0,
                            left: 0,
                            zIndex: 1000,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#fff"
                        }}
                    >
                        <LoadingOutlined style={{ fontSize: 48 }} spin />
                        <p style={{ marginTop: 16 }}>{this.props.loadingText}</p>
                    </div>
                )}
            </>
        );
    }
}

export { LoadingOverlay };
