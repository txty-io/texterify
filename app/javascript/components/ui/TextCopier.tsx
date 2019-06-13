import { Button, Icon, Tooltip } from "antd";
import * as React from "react";

type IProps = {
  textToCopy: any;
};
type IState = {
  copied: boolean;
};

class TextCopier extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      copied: false
    };
  }

  // https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
  copyToClipboard = (e: any) => {
    const el = document.createElement("textarea");
    el.value = this.props.textToCopy;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    const selected =
      document.getSelection().rangeCount > 0
        ? document.getSelection().getRangeAt(0)
        : false;
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    if (selected) {
      document.getSelection().removeAllRanges();
      document.getSelection().addRange(selected);
    }

    this.setState({ copied: true });
  }

  render() {
    return (
      <>
        {document.queryCommandSupported("copy") &&
          <Tooltip
            placement="top"
            title={this.state.copied ? "Copied to clipboard" : "Copy"}
            onVisibleChange={(visible: boolean) => {
              if (!visible) {
                this.setState({ copied: visible });
              }
            }}
          >
            <span onClick={this.copyToClipboard} role="button" style={{ cursor: "pointer", padding: "4px 8px" }}>
              <Icon type="copy" />
            </span>
          </Tooltip>}
      </>
    );
  }
}

export { TextCopier };
