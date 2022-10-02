import { Button } from "antd";
import * as React from "react";
import * as uuid from "uuid";
import { IKey } from "../api/v1/KeysAPI";
import { TexterifyModal } from "../ui/TexterifyModal";
import { AddTagToKeyForm } from "./AddTagToKeyForm";

interface IProps {
    visible: boolean;
    translationKey: IKey;
    onCancelRequest(): void;
}

export function AddTagToKeyModal(props: IProps) {
    const formId = `addTagToKeyForm-${uuid.v4()}`;
    return (
        <TexterifyModal
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
                    <Button form={formId} type="primary" htmlType="submit" data-id="add-tag-to-form-submit-button">
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
                onSaved={() => {
                    props.onCancelRequest();
                }}
            />
        </TexterifyModal>
    );
}
