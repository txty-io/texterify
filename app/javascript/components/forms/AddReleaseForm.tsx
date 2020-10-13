import { Button, Form, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { ExportConfigsAPI, IExportConfig, IGetExportConfigsResponse } from "../api/v1/ExportConfigsAPI";
import { ReleasesAPI } from "../api/v1/ReleasesAPI";
import { ErrorUtils } from "../ui/ErrorUtils";
import { TexterifyModal } from "../ui/TexterifyModal";

interface IProps {
    projectId: string;
    visible: boolean;
    onCancelRequest();
    onCreated?(): void;
}

interface IState {
    exportConfigId: string;
    exportConfigsResponse: IGetExportConfigsResponse;
    exportConfigsLoading: boolean;
}

class AddReleaseForm extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        exportConfigId: null,
        exportConfigsResponse: null,
        exportConfigsLoading: false
    };

    async componentDidMount() {
        try {
            const exportConfigsResponse = await ExportConfigsAPI.getExportConfigs({ projectId: this.props.projectId });

            this.setState({
                exportConfigsResponse: exportConfigsResponse,
                exportConfigsLoading: false
            });
        } catch (error) {
            console.error(error);
        }
    }

    handleSubmit = async () => {
        const response = await ReleasesAPI.createRelease({
            projectId: this.props.projectId,
            exportConfigId: this.state.exportConfigId
        });

        if (response.errors) {
            ErrorUtils.showErrors(response.errors);

            return;
        }

        if (this.props.onCreated) {
            this.props.onCreated();
        }
    };

    render() {
        return (
            <TexterifyModal
                title="Create a new release"
                visible={this.props.visible}
                footer={
                    <div style={{ margin: "6px 0" }}>
                        <Button
                            onClick={() => {
                                this.props.onCancelRequest();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button form="addReleaseForm" type="primary" htmlType="submit">
                            Create release
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <Form ref={this.formRef} onFinish={this.handleSubmit} style={{ maxWidth: "100%" }} id="addReleaseForm">
                    <h3>Export config</h3>
                    <Form.Item name="exportConfig" rules={[]}>
                        <Select
                            placeholder="Select a configuration"
                            style={{ width: "100%" }}
                            onChange={(value: string) => {
                                this.setState({ exportConfigId: value });
                            }}
                            allowClear
                        >
                            {this.state.exportConfigsResponse &&
                                this.state.exportConfigsResponse.data.map((exportConfig) => {
                                    return (
                                        <Select.Option value={exportConfig.id} key={exportConfig.id}>
                                            {exportConfig.attributes.name}
                                        </Select.Option>
                                    );
                                })}
                        </Select>
                    </Form.Item>
                </Form>
            </TexterifyModal>
        );
    }
}

export { AddReleaseForm };
