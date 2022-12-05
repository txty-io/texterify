import { Button, Form, Input } from "antd";
import { FormInstance } from "antd/lib/form";
import * as React from "react";
import { FlavorsAPI, IFlavor } from "../api/v1/FlavorsAPI";
import { ERRORS, ErrorUtils } from "../ui/ErrorUtils";
import { ImportFileFormats } from "../utilities/ImportUtils";

interface IFormValues {
    name: string;
    fileFormat: ImportFileFormats;
    filePath: string;
    defaultLanguageFilePath: string;
    splitOn: string;
}

export interface IAddEditFlavorFormProps {
    flavorToEdit?: IFlavor;
    projectId: string;
    hideDefaultSubmitButton?: boolean;
    clearFieldsAfterSubmit?: boolean;
    formId?: string;
    onSaved?(): void;
}

class AddEditFlavorForm extends React.Component<IAddEditFlavorFormProps> {
    formRef = React.createRef<FormInstance>();

    handleSubmit = async (values: IFormValues) => {
        let response;

        if (this.props.flavorToEdit) {
            response = await FlavorsAPI.updateFlavor({
                projectId: this.props.projectId,
                flavorId: this.props.flavorToEdit.id,
                name: values.name
            });
        } else {
            response = await FlavorsAPI.createFlavor({
                projectId: this.props.projectId,
                name: values.name
            });
        }

        if (response.errors) {
            if (ErrorUtils.hasError("name", ERRORS.TAKEN, response.errors)) {
                this.formRef.current?.setFields([
                    {
                        name: "name",
                        errors: [ErrorUtils.getErrorMessage("name", ERRORS.TAKEN)]
                    }
                ]);
            } else {
                ErrorUtils.showErrors(response.errors);
            }
        } else {
            if (this.props.onSaved) {
                this.props.onSaved();
            }

            if (this.props.clearFieldsAfterSubmit) {
                this.formRef.current?.resetFields();
            }
        }
    };

    render() {
        return (
            <>
                <Form
                    ref={this.formRef}
                    onFinish={this.handleSubmit}
                    style={{ maxWidth: "100%", display: "flex", flexDirection: "column" }}
                    id={this.props.formId}
                    initialValues={
                        this.props.flavorToEdit && {
                            name: this.props.flavorToEdit.attributes.name
                        }
                    }
                >
                    <h3>Name *</h3>
                    <Form.Item
                        name="name"
                        rules={[{ required: true, whitespace: true, message: "Please enter the name of the flavor." }]}
                    >
                        <Input placeholder="Name" autoFocus />
                    </Form.Item>

                    {!this.props.hideDefaultSubmitButton && (
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ marginLeft: "auto", marginTop: 24 }}
                            data-id="export-config-form-submit-button"
                        >
                            {this.props.flavorToEdit ? "Save changes" : "Add flavor"}
                        </Button>
                    )}
                </Form>
            </>
        );
    }
}

export { AddEditFlavorForm };
