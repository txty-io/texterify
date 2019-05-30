import { Icon } from "antd";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Link } from "react-router-dom";

import { Routes } from "../routing/Routes";

interface IProps {
  isVisible: boolean;
  loadingText: string;
}
interface IState { }

class LoadingOverlay extends React.Component<IProps, IState> {
  componentWillUnmount(): void {
    document.body.style.overflow = "";
  }

  render(): JSX.Element {
    if (this.props.isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return (
      <>
        {this.props.isVisible &&
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
            <Icon type="loading" style={{ fontSize: 48 }} spin />
            <p style={{ marginTop: 16 }}>{this.props.loadingText}</p>
          </div>
        }
      </>
    );
  }
}

export { LoadingOverlay };
