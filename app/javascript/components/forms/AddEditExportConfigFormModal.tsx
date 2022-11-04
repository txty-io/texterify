import { Button } from "antd";
import * as React from "react";
import { TexterifyModal } from "../ui/TexterifyModal";
import { AddEditExportConfigForm, IAddEditExportConfigFormProps } from "./AddEditExportConfigForm";
import * as uuid from "uuid";
import useFlavors from "../hooks/useFlavors";

interface IProps {
    visible: boolean;
    formProps: IAddEditExportConfigFormProps;
    onCancelRequest(): void;
}

export function AddEditExportConfigFormModal(props: IProps) {
    const formId = `addEditExportConfigForm-${uuid.v4()}`;

    return (
        <TexterifyModal
            title={props.formProps.exportConfigToEdit ? "Edit export config" : "Add a new export config"}
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
                    <Button form={formId} type="primary" htmlType="submit" data-id="export-config-form-submit-button">
                        {props.formProps.exportConfigToEdit ? "Save changes" : "Create export config"}
                    </Button>
                </div>
            }
            onCancel={async () => {
                props.onCancelRequest();
            }}
            big
        >
            <AddEditExportConfigForm {...props.formProps} hideDefaultSubmitButton formId={formId} />
        </TexterifyModal>
    );
}
