import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";
import * as React from "react";

type IProps = ButtonProps & {};
interface IState { }

class PrimaryButton extends React.Component<IProps, IState> {
  render() {
    return (
      <Button {...this.props} className="primary-button">
        {this.props.children}
      </Button>
    );
  }
}

export { PrimaryButton };
