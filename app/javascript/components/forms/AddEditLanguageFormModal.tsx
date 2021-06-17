import { Button } from "antd";
import * as React from "react";
import { TexterifyModal } from "../ui/TexterifyModal";
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
            <TexterifyModal
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
                        <Button form={formId} type="primary" htmlType="submit">
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
            </TexterifyModal>
        );
    }
}

export { AddEditLanguageFormModal };
