import { Button, Modal } from "antd";
import * as React from "react";
import { IProps as NewProjectFormProps, NewProjectForm } from "./NewProjectForm";

interface IProps {
  visible: boolean;
  newProjectFormProps: NewProjectFormProps;
  onCancelRequest?(): void;
}
interface IState { }

class NewProjectFormModal extends React.Component<IProps, IState> {
  render() {
    return (
      <Modal
        maskClosable={false}
        title="Add a new project"
        visible={this.props.visible}
        footer={
          <div style={{ margin: "6px 0" }}>
            <Button onClick={() => { this.props.onCancelRequest(); }}>
              Cancel
            </Button>
            <Button form="newProjectForm" type="primary" htmlType="submit">
              Create project
            </Button>
          </div>}
        onCancel={this.props.onCancelRequest}
        destroyOnClose
      >
        <NewProjectForm {...this.props.newProjectFormProps} />
      </Modal>
    );
  }
}

export { NewProjectFormModal };
