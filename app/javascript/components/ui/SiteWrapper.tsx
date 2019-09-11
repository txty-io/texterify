import * as React from "react";
import { Styles } from "./Styles";

interface IProps {
  style?: React.CSSProperties;
}
interface IState { }

class SiteWrapper extends React.Component<IProps, IState> {
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
          <h1 style={{ marginBottom: 24, fontSize: 32, fontFamily: "Pacifico" }}>Texterify</h1>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export { SiteWrapper };
