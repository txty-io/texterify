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
                <Tag.CheckableTag
                    {...this.props}
                    checked={this.state.checked}
                    onChange={this.handleChange}
                    style={{
                        background: this.state.checked ? "var(--column-tag-color)" : "transparent",
                        borderColor: "var(--column-tag-color)",
                        color: this.state.checked ? "#fff" : "var(--column-tag-color)"
                    }}
                />
            </div>
        );
    }
}
export { ColumnTag };
