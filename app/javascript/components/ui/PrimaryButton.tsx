import { Button } from "antd";
import { ButtonProps } from "antd/lib/button";
import * as React from "react";

type IProps = ButtonProps;

class PrimaryButton extends React.Component<IProps> {
    render() {
        return (
            <Button {...this.props} className="primary-button">
                {this.props.children}
            </Button>
        );
    }
}

export { PrimaryButton };
