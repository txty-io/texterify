import { Button } from "antd";
import * as React from "react";
import * as uuid from "uuid";
import { IKey } from "../api/v1/KeysAPI";
import { CustomModal } from "../ui/CustomModal";
import { AddTagToKeyForm } from "./AddTagToKeyForm";

interface IProps {
    visible: boolean;
    translationKey: IKey;
    onCancelRequest(): void;
    onSaved(): void;
}

export function AddTagToKeyModal(props: IProps) {
    const [saving, setSaving] = React.useState<boolean>(false);

    const formId = `addTagToKeyForm-${uuid.v4()}`;
    return (
        <CustomModal
            title="Add tag to key"
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
                    <Button
                        loading={saving}
                        form={formId}
                        type="primary"
                        htmlType="submit"
                        data-id="add-tag-to-key-form-submit-button"
                    >
                        Add tag
                    </Button>
                </div>
            }
            onCancel={props.onCancelRequest}
        >
            <AddTagToKeyForm
                translationKey={props.translationKey}
                formId={formId}
                noButton
                onSaving={() => {
                    setSaving(true);
                }}
                onSaved={() => {
                    setSaving(false);
                    props.onSaved();
                }}
            />
        </CustomModal>
    );
}
