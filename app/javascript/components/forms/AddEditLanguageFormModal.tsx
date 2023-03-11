import { Button } from "antd";
import * as React from "react";
import { CustomModal } from "../ui/CustomModal";
import { AddEditLanguageForm, IAddEditLanguageFormProps } from "./AddEditLanguageForm";
import * as uuid from "uuid";

interface IProps {
    visible: boolean;
    languageFormProps: IAddEditLanguageFormProps;
    onCancelRequest(): void;
}

class AddEditLanguageFormModal extends React.Component<IProps> {
    render() {
        const formId = `addEditLanguageForm-${uuid.v4()}`;

        return (
            <CustomModal
                title={this.props.languageFormProps.languageToEdit ? "Edit language" : "Add a new language"}
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
                        <Button form={formId} type="primary" htmlType="submit" data-id="language-form-submit-button">
                            {this.props.languageFormProps.languageToEdit ? "Save changes" : "Create language"}
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
                afterClose={() => {
                    this.setState({ userChangedName: false });
                }}
            >
                <AddEditLanguageForm {...this.props.languageFormProps} hideDefaultSubmitButton formId={formId} />
            </CustomModal>
        );
    }
}

export { AddEditLanguageFormModal };
