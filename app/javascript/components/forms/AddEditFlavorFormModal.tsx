import { Button } from "antd";
import * as React from "react";
import * as uuid from "uuid";
import { CustomModal } from "../ui/CustomModal";
import { AddEditFlavorForm, IAddEditFlavorFormProps } from "./AddEditFlavorForm";

interface IProps {
    visible: boolean;
    formProps: IAddEditFlavorFormProps;
    onCancelRequest(): void;
}

export function AddEditFlavorFormModal(props: IProps) {
    const formId = `addEditFlavorForm-${uuid.v4()}`;

    return (
        <CustomModal
            title={props.formProps.flavorToEdit ? "Edit flavor" : "Add a new flavor"}
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
                    <Button form={formId} type="primary" htmlType="submit" data-id="flavor-form-submit-button">
                        {props.formProps.flavorToEdit ? "Save changes" : "Create flavor"}
                    </Button>
                </div>
            }
            onCancel={async () => {
                props.onCancelRequest();
            }}
        >
            <AddEditFlavorForm {...props.formProps} hideDefaultSubmitButton formId={formId} />
        </CustomModal>
    );
}
