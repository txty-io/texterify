import { Button, Form, Input, Select } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { ErrorUtils } from "../ui/ErrorUtils";
import { TexterifyModal } from "../ui/TexterifyModal";
import { IValidation, IValidationLinkedTo, ValidationsAPI } from "../api/v1/ValidationsAPI";

interface IProps {
    validationToEdit?: IValidation;
    linkedId: string;
    linkedType: IValidationLinkedTo;
    visible: boolean;
    onCancelRequest();
    onCreated?(): void;
}

interface IState {
    match: string;
}

interface IFormValues {
    name: string;
    description: string;
    content: string;
}

class AddEditValidationForm extends React.Component<IProps, IState> {
    formRef = React.createRef<FormInstance>();

    constructor(props: IProps) {
        super(props);

        this.state = {
            match: props.validationToEdit?.attributes.match || "contains"
        };
    }

    handleSubmit = async (values: IFormValues) => {
        let response;

        if (this.props.validationToEdit) {
            response = await ValidationsAPI.updateValidation({
                linkedId: this.props.linkedId,
                linkedType: this.props.linkedType,
                validationId: this.props.validationToEdit.id,
                name: values.name,
                description: values.description,
                match: this.state.match,
                content: values.content
            });
        } else {
            response = await ValidationsAPI.createValidation({
                linkedId: this.props.linkedId,
                linkedType: this.props.linkedType,
                name: values.name,
                description: values.description,
                match: this.state.match,
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
                value={this.state.match}
                style={{ minWidth: 140, textAlign: "left" }}
                onChange={(value) => {
                    this.setState({ match: value });
                }}
            >
                <Select.Option value="contains">contains</Select.Option>
                <Select.Option value="equals">equals</Select.Option>
            </Select>
        );

        return (
            <TexterifyModal
                title={this.props.validationToEdit ? "Edit validation" : "Add a new validation"}
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
                        <Button form="addEditValidationForm" type="primary" htmlType="submit">
                            {this.props.validationToEdit ? "Save changes" : "Create validation"}
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%" }}
                    id="addEditValidationForm"
                    initialValues={
                        this.props.validationToEdit && {
                            name: this.props.validationToEdit.attributes.name,
                            description: this.props.validationToEdit.attributes.description,
                            content: this.props.validationToEdit.attributes.content
                        }
                    }
                >
                    <h3>Name *</h3>
                    <Form.Item
                        name="name"
                        rules={[
                            { required: true, whitespace: true, message: "Please enter the name of the validation." }
                        ]}
                    >
                        <Input placeholder="Name" />
                    </Form.Item>

                    <h3>Description</h3>
                    <Form.Item name="description" rules={[{ required: false, whitespace: true }]}>
                        <Input placeholder="Description" />
                    </Form.Item>

                    <h3>Validation *</h3>
                    <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
                        <span style={{ marginRight: 8 }}>Report if text</span>
                        <Form.Item
                            name="content"
                            style={{ margin: 0, flexGrow: 1 }}
                            rules={[{ required: true, whitespace: true, message: "Please enter a validation." }]}
                        >
                            <Input addonBefore={selectBefore} />
                        </Form.Item>
                    </div>
                </Form>
            </TexterifyModal>
        );
    }
}

export { AddEditValidationForm };
