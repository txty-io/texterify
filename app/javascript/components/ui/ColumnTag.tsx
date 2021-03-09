import { Tag } from "antd";
import * as React from "react";

interface IColumnTagProps {
    defaultChecked?: boolean;
    onChange(checked: boolean): void;
}
interface IColumnTagState {
    checked: boolean;
}

class ColumnTag extends React.Component<IColumnTagProps, IColumnTagState> {
    constructor(props: IColumnTagProps) {
        super(props);

        this.state = {
            checked: props.defaultChecked
        };
    }

    handleChange = (checked: boolean) => {
        this.setState({ checked: checked });
        this.props.onChange(checked);
    };

    render() {
        return (
            <div style={{ marginTop: 4 }}>
                <Tag.CheckableTag {...this.props} checked={this.state.checked} onChange={this.handleChange} />
            </div>
        );
    }
}
export { ColumnTag };
