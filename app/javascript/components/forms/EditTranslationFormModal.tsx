import { Button } from "antd";
import * as React from "react";
import * as uuid from "uuid";
import { CustomModal } from "../ui/CustomModal";
import { EditTranslationForm, IEditTranslationFormProps } from "./EditTranslationForm";

interface IProps {
    visible: boolean;
    formProps: IEditTranslationFormProps;
    onCancelRequest(): void;
}

export function EditTranslationFormModal(props: IProps) {
    const formId = `editTranslationForm-${uuid.v4()}`;
    return (
        <CustomModal
            title={props.formProps.keyResponse?.data.attributes.name}
            visible={props.visible}
            footer={
                <div style={{ margin: "6px 0" }}>
                    <Button
                        onClick={() => {
                            props.onCancelRequest();
                        }}
                    >
                        Cancel
                    </Button>
                    <Button form={formId} type="primary" htmlType="submit" data-id="translation-form-submit-button">
                        Save changes
                    </Button>
                </div>
            }
            onCancel={props.onCancelRequest}
        >
            <EditTranslationForm {...props.formProps} formId={formId} />
        </CustomModal>
    );
}
