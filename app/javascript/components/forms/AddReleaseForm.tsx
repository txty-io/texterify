import { Alert, Button, Form, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { Link } from "react-router-dom";
import { ExportConfigsAPI, IGetExportConfigsResponse } from "../api/v1/ExportConfigsAPI";
import { ReleasesAPI } from "../api/v1/ReleasesAPI";
import { Routes } from "../routing/Routes";
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
    submitting: boolean;
}

class AddReleaseForm extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        exportConfigId: null,
        exportConfigsResponse: null,
        exportConfigsLoading: true,
        submitting: false
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
        this.setState({ submitting: true });

        try {
            const response = await ReleasesAPI.createRelease({
                projectId: this.props.projectId,
                exportConfigId: this.state.exportConfigId
            });

            if (response.errors) {
                if (response.errors[0]?.code === "NO_LANGUAGES_WITH_LANGUAGE_CODE") {
                    this.formRef.current?.setFields([
                        {
                            name: "exportConfig",
                            errors: [
                                "You need to specify the language code for at least one of your languages before you can create releases."
                            ]
                        }
                    ]);
                } else {
                    ErrorUtils.showErrors(response.errors);
                }

                return;
            }

            if (this.props.onCreated) {
                this.props.onCreated();
            }
        } catch (error) {
            console.error(error);
        }

        this.setState({ submitting: false });
    };

    hasExportConfigs = () => {
        return this.state.exportConfigsLoading || this.state.exportConfigsResponse.data.length > 0;
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
                        <Button
                            form="addReleaseForm"
                            type="primary"
                            htmlType="submit"
                            disabled={!this.hasExportConfigs()}
                            loading={this.state.submitting}
                        >
                            Create release
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <Form ref={this.formRef} onFinish={this.handleSubmit} style={{ maxWidth: "100%" }} id="addReleaseForm">
                    <h3>Export config</h3>
                    {!this.hasExportConfigs() && (
                        <Alert
                            type="info"
                            showIcon
                            message="No export configuration"
                            description={
                                <p>
                                    <Link
                                        to={Routes.DASHBOARD.PROJECT_EXPORT_CONFIGURATIONS.replace(
                                            ":projectId",
                                            this.props.projectId
                                        )}
                                    >
                                        Create an export configuration
                                    </Link>{" "}
                                    to create releases.
                                </p>
                            }
                        />
                    )}
                    {this.hasExportConfigs() && (
                        <Form.Item
                            name="exportConfig"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select an export configuration."
                                }
                            ]}
                        >
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
                    )}
                </Form>
            </TexterifyModal>
        );
    }
}

export { AddReleaseForm };
