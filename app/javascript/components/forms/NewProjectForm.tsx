import { Button, Form, Input, Modal } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import { ProjectsAPI } from "../api/v1/ProjectsAPI";
import { dashboardStore } from "../stores/DashboardStore";

interface IProps {
  isEdit?: boolean;
  onError(errors: any): void;
  onCreated?(projectId: string): void;
}
interface IState { }

class NewProjectFormUnwrapped extends React.Component<IProps & { form: any }, IState> {
  handleSubmit = (e: any): void => {
    e.preventDefault();
    this.props.form.validateFields(async (err: any, values: any) => {
      if (!err) {
        let project;

        if (this.props.isEdit) {
          project = await ProjectsAPI.updateProject(dashboardStore.currentProject.id, values.name, values.description);
        } else {
          project = await ProjectsAPI.createProject(values.name, values.description);
        }

        if (!project.errors) {
          dashboardStore.currentProject = project.data;
          this.props.onCreated(project.data.id);
        } else {
          this.props.onError(project.errors);
        }
      }
    });
  }

  render(): JSX.Element {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form id="newProjectForm" onSubmit={this.handleSubmit} style={{ maxWidth: "100%" }}>
        <h3>Name</h3>
        <Form.Item>
          {getFieldDecorator("name", {
            initialValue: this.props.isEdit ? dashboardStore.currentProject.attributes.name : "",
            rules: [{ required: true, message: "Please enter the name of the project." }]
          })(
            <Input placeholder="Name" autoFocus={!this.props.isEdit} />
          )}
        </Form.Item>

        <h3>Description</h3>
        <Form.Item>
          {getFieldDecorator("description", {
            initialValue: this.props.isEdit ? dashboardStore.currentProject.attributes.description : ""
          })(
            <Input.TextArea rows={4} placeholder="Description" />
          )}
        </Form.Item>
      </Form>
    );
  }
}

const NewProjectForm: any = Form.create()(NewProjectFormUnwrapped);
export { NewProjectForm, IProps };
