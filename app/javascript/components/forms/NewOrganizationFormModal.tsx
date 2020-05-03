import { Button, Modal } from "antd";
import * as React from "react";
import { IProps as NewOrganizationFormProps, NewOrganizationForm } from "./NewOrganizationForm";

interface IProps {
    visible: boolean;
    newOrganizationFormProps: NewOrganizationFormProps;
    onCancelRequest?(): void;
}

class NewOrganizationFormModal extends React.Component<IProps> {
    render() {
        return (
            <Modal
                maskClosable={false}
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
                        <Button form="newOrganizationForm" type="primary" htmlType="submit">
                            Create organization
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
                destroyOnClose
            >
                <NewOrganizationForm {...this.props.newOrganizationFormProps} />
            </Modal>
        );
    }
}

export { NewOrganizationFormModal };
