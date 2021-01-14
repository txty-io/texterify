import { Button } from "antd";
import * as React from "react";
import { TexterifyModal } from "../ui/TexterifyModal";
import { IProps as NewOrganizationFormProps, NewOrganizationForm } from "./NewOrganizationForm";

interface IProps {
    visible: boolean;
    newOrganizationFormProps: NewOrganizationFormProps;
    onCancelRequest?(): void;
}

class NewOrganizationFormModal extends React.Component<IProps> {
    render() {
        return (
            <TexterifyModal
                title="Add a new organization"
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
                        <Button
                            data-id="new-organization-form-create-organization"
                            form="newOrganizationForm"
                            type="primary"
                            htmlType="submit"
                        >
                            Create organization
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <NewOrganizationForm {...this.props.newOrganizationFormProps} />
            </TexterifyModal>
        );
    }
}

export { NewOrganizationFormModal };
