import { Button, Checkbox, Input, Modal, Tooltip, Form } from "antd";
import * as React from "react";
import { KeysAPI } from "../api/v1/KeysAPI";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { FormInstance } from "antd/lib/form";
import { ErrorUtils, ERRORS } from "../ui/ErrorUtils";

interface IProps {
    projectId: string;
    visible: boolean;
    keyToEdit?: any;
    onCancelRequest(): void;
    onCreated?(): void;
}

class NewKeyForm extends React.Component<IProps> {
    formRef = React.createRef<FormInstance>();

    handleSubmit = async (values: any) => {
        const response = await KeysAPI.createKey(
            this.props.projectId,
            values.name,
            values.description,
            values.html_enabled
        );
        if (response.errors) {
            if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                this.formRef.current.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
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
    };

    render() {
        return (
            <Modal
                maskClosable={false}
                title="Add a new key"
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
                        <Button form="newKeyForm" type="primary" htmlType="submit">
                            Create key
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
                destroyOnClose
            >
                <Form
                    ref={this.formRef}
                    id="newKeyForm"
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    initialValues={
                        this.props.keyToEdit && {
                            name: this.props.keyToEdit.attributes.name,
                            description: this.props.keyToEdit.attributes.description,
                            html_enabled: this.props.keyToEdit.attributes.html_enabled || false
                        }
                    }
                >
                    <h3>Name *</h3>
                    <Form.Item name="name" rules={[{ required: true, message: "Please enter the name of the key." }]}>
                        <Input placeholder="Name" autoFocus />
                    </Form.Item>

                    <h3>Description</h3>
                    <Form.Item name="description" rules={[{ required: false }]}>
                        <Input placeholder="Description" />
                    </Form.Item>

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Item
                            name="html_enabled"
                            rules={[{ required: false }]}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                        >
                            <Checkbox>HTML</Checkbox>
                        </Form.Item>
                        <Tooltip title="If checked a editor will de used for translation. You can still change this later.">
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </div>
                </Form>
            </Modal>
        );
    }
}

export { NewKeyForm };
