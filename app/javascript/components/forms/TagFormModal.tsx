import { Button } from "antd";
import * as React from "react";
import * as uuid from "uuid";
import { CustomModal } from "../ui/CustomModal";
import { ITagFromProps, TagForm } from "./TagForm";

interface IProps {
    visible: boolean;
    formProps: ITagFromProps;
    onCancelRequest(): void;
}

export function TagFormModal(props: IProps) {
    const formId = `tagForm-${uuid.v4()}`;
    return (
        <CustomModal
            title={props.formProps.tag ? "Change tag" : "Create tag"}
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
                    <Button form={formId} type="primary" htmlType="submit" data-id="tag-form-submit-button">
                        {props.formProps.tag ? "Save changes" : "Create"}
                    </Button>
                </div>
            }
            onCancel={props.onCancelRequest}
        >
            <TagForm {...props.formProps} formId={formId} noButton />
        </CustomModal>
    );
}
