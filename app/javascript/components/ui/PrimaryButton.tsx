import { Button, Layout } from "antd";
import { ButtonProps } from "antd/lib/button";
import * as React from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";

type IProps = ButtonProps & {};
interface IState { }

class PrimaryButton extends React.Component<IProps, IState> {
  render(): JSX.Element {
    return (
      <Button {...this.props} className="primary-button">
        {this.props.children}
      </Button>
    );
  }
}

export {
  PrimaryButton
};
