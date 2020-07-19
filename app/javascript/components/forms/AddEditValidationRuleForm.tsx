import { Button, Form, Input, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { ErrorUtils } from "../ui/ErrorUtils";
import { TexterifyModal } from "../ui/TexterifyModal";
import { ValidationRulesAPI } from "../api/v1/ValidationRulesAPI";

interface IProps {
    ruleToEdit?: any;
    projectId: string;
    visible: boolean;
    onCancelRequest();
    onCreated?(): void;
}

interface IState {
    type: string;
}

interface IFormValues {
    name: string;
    type: string;
    content: string;
}

class AddEditValidationRuleForm extends React.Component<IProps> {
    formRef = React.createRef<FormInstance>();

    state: IState = {
        type: "containsNot"
    };

    handleSubmit = async (values: IFormValues) => {
        let response;

        if (this.props.ruleToEdit) {
            response = await ValidationRulesAPI.updateValidationRule({
                projectId: this.props.projectId,
                ruleId: this.props.ruleToEdit.id,
                name: values.name,
                type: values.type,
                content: values.content
            });
        } else {
            response = await ValidationRulesAPI.createValidationRule({
                projectId: this.props.projectId,
                name: values.name,
                type: values.type,
                content: values.content
            });
        }

        if (response.errors) {
            ErrorUtils.showErrors(response.errors);

            return;
        }

        if (this.props.onCreated) {
            this.props.onCreated();
        }
    };

    render() {
        const selectBefore = (
            <Select
                value={this.state.type}
                style={{ minWidth: 140, textAlign: "left" }}
                onChange={(value) => {
                    this.setState({ type: value });
                }}
            >
                <Select.Option value="containsNot">contains not</Select.Option>
                <Select.Option value="contains">contains</Select.Option>
            </Select>
        );

        return (
            <TexterifyModal
                title={this.props.ruleToEdit ? "Edit validation rule" : "Add a new rule"}
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
                        <Button form="addEditValidationRuleForm" type="primary" htmlType="submit">
                            {this.props.ruleToEdit ? "Save changes" : "Create rule"}
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    id="addEditValidationRuleForm"
                    initialValues={
                        this.props.ruleToEdit && {
                            name: this.props.ruleToEdit.attributes.name
                        }
                    }
                >
                    <h3>Name *</h3>
                    <Form.Item
                        name="name"
                        rules={[{ required: true, whitespace: true, message: "Please enter the name of the rule." }]}
                    >
                        <Input placeholder="Name" />
                    </Form.Item>

                    <h3>Description</h3>
                    <Form.Item name="description" rules={[{ required: false, whitespace: true }]}>
                        <Input placeholder="Description" />
                    </Form.Item>

                    <h3>Rule *</h3>
                    <Form.Item
                        name="content"
                        rules={[{ required: true, whitespace: true, message: "Please enter a validation." }]}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            Text <Input addonBefore={selectBefore} style={{ marginLeft: 8 }} />
                        </div>
                    </Form.Item>
                </Form>
            </TexterifyModal>
        );
    }
}

export { AddEditValidationRuleForm };
