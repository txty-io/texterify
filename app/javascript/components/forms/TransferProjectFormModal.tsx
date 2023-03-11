import { Button } from "antd";
import * as React from "react";
import { IProject } from "../stores/DashboardStore";
import { CustomModal } from "../ui/CustomModal";
import { TransferProjectForm } from "./TransferProjectForm";

interface IProps {
    project: IProject;
    visible: boolean;
    onClose(): void;
    onSuccess(): void;
}

interface IState {
    organizationsResponse: any;
    organizationsLoading: boolean;
}

class TransferProjectFormModal extends React.Component<IProps, IState> {
    state: IState = {
        organizationsResponse: null,
        organizationsLoading: false
    };

    render() {
        return (
            <CustomModal
                title="Transfer project"
                visible={this.props.visible}
                onCancel={() => {
                    this.props.onClose();
                }}
                afterClose={() => {
                    this.props.onClose();
                }}
                footer={
                    <div style={{ margin: "6px 0" }}>
                        <Button
                            onClick={() => {
                                this.props.onClose();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            data-id="project-transfer-submit"
                            form="transferProjectForm"
                            type="primary"
                            htmlType="submit"
                        >
                            Transfer
                        </Button>
                    </div>
                }
            >
                <TransferProjectForm
                    project={this.props.project}
                    onSuccess={() => {
                        this.props.onSuccess();
                    }}
                />
            </CustomModal>
        );
    }
}

export { TransferProjectFormModal };
