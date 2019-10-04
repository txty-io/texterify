import { Card, Icon } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { TextBadge } from "./TextBadge";

type IProps = {
    exportConfig: any;
    style?: React.CSSProperties;
    onEdit?(exportConfig: any): void;
    onDelete?(exportConfig: any): void;
};

@observer
class ProjectExportConfig extends React.Component<IProps> {
    render() {
        return (
            <Card
                style={{ width: 400, ...this.props.style }}
                actions={[
                    this.props.onEdit && <Icon type="setting" key="setting" onClick={() => this.props.onEdit(this.props.exportConfig)} />,
                    this.props.onDelete && <Icon type="delete" key="delete" onClick={() => this.props.onDelete(this.props.exportConfig)} />,
                ]}
            >
                <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
                    <h3>{this.props.exportConfig.attributes.name}</h3>
                    <TextBadge
                        text={this.props.exportConfig.id}
                        withCopy={this.props.exportConfig.id}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div>
                        <span style={{ marginRight: 16, fontWeight: "bold" }}>File format:</span>
                        {this.props.exportConfig.attributes.file_format}
                    </div>
                    <div style={{ display: "flex" }}>
                        <div style={{ marginRight: 16, fontWeight: "bold" }}>File path:</div>
                        {this.props.exportConfig.attributes.file_path}
                    </div>
                    {this.props.exportConfig.attributes.default_language_file_path && <div style={{ display: "flex" }}>
                        <div style={{ marginRight: 16, fontWeight: "bold" }}>Default language file path:</div>
                        {this.props.exportConfig.attributes.default_language_file_path}
                    </div>}
                </div>
            </Card>
        );
    }
}

export { ProjectExportConfig };
