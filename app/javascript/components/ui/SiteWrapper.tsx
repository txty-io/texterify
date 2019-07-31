import * as React from "react";
import { Styles } from "./Styles";

interface IProps { }
interface IState { }

class SiteWrapper extends React.Component<IProps, IState> {
  render(): JSX.Element {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 40,
          margin: "auto"
        }}
      >
        <h1 style={{ marginBottom: 0, fontSize: 32, fontFamily: "Pacifico" }}>Texterify</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flexGrow: 1,
            alignSelf: "center",
            padding: "24px 0 64px 0"
          }}
        >
          <div
            style={{
              padding: 40,
              background: "#fff",
              border: "1px solid #e8e8e8",
              borderRadius: Styles.DEFAULT_BORDER_RADIUS,
              boxShadow: "rgba(61, 172, 206, 0.05) 0px 0px 24px",
              maxWidth: 480
            }}
          >
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export { SiteWrapper };
