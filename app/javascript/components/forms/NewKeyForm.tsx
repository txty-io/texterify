import { Button, Checkbox, Form, Icon, Input, Modal, Tooltip } from "antd";
import * as React from "react";
import { KeysAPI } from "../api/v1/KeysAPI";

interface IProps {
  form: any;
  projectId: string;
  visible: boolean;
  keyToEdit?: any;
  onCancelRequest(): void;
  onCreated?(): void;
}
interface IState { }

class NewKeyFormUnwrapped extends React.Component<IProps, IState> {
  handleSubmit = (e: any): void => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (!err) {
        const response = await KeysAPI.createKey(this.props.projectId, values.name, values.description, values.html_enabled);
        if (response.errors) {
          response.errors.map((error) => {
            if (error.details === "A key with that name already exists for this project.") {
              this.props.form.setFields({
                name: {
                  value: values.name,
                  errors: [new Error(error.details)]
                }
              });
            }
          });

          return;
        }

        if (this.props.onCreated) {
          this.props.onCreated();
        }
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        maskClosable={false}
        title="Add a new key"
        visible={this.props.visible}
        footer={
          <div style={{ margin: "6px 0" }}>
            <Button onClick={() => { this.props.onCancelRequest(); }}>
              Cancel
            </Button>
            <Button form="newKeyForm" type="primary" htmlType="submit">
              Create key
            </Button>
          </div>}
        onCancel={this.props.onCancelRequest}
        destroyOnClose
      >
        <Form id="newKeyForm" onSubmit={this.handleSubmit} style={{ maxWidth: "100%" }}>
          <h3>Name *</h3>
          <Form.Item>
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "Please enter the name of the key." }],
              initialValue: this.props.keyToEdit && this.props.keyToEdit.attributes.name
            })(
              <Input placeholder="Name" autoFocus />
            )}
          </Form.Item>

          <h3>Description</h3>
          <Form.Item>
            {getFieldDecorator("description", {
              rules: [{ required: false }],
              initialValue: this.props.keyToEdit && this.props.keyToEdit.attributes.description
            })(
              <Input placeholder="Description" />
            )}
          </Form.Item>

          <Form.Item>
            {getFieldDecorator("html_enabled", {
              rules: [{ required: false }],
              initialValue: (this.props.keyToEdit && this.props.keyToEdit.attributes.html_enabled) || false,
              valuePropName: "checked"
            })(
              <Checkbox>HTML</Checkbox>
            )}
            <Tooltip title="If checked a editor will de used for translation. You can still change this later.">
              <QuestionCircleOutlined />
            </Tooltip>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const NewKeyForm: any = Form.create()(NewKeyFormUnwrapped);
export { NewKeyForm };
