import { Button } from "antd";
import * as React from "react";
import { TexterifyModal } from "../ui/TexterifyModal";
import { IProps as NewProjectFormProps, NewProjectForm } from "./NewProjectForm";

interface IProps {
    visible: boolean;
    newProjectFormProps: NewProjectFormProps;
    onCancelRequest?(): void;
}

class NewProjectFormModal extends React.Component<IProps> {
    render() {
        return (
            <TexterifyModal
                title="Add a new project"
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
                        <Button form="newProjectForm" type="primary" htmlType="submit">
                            Create project
                        </Button>
                    </div>
                }
                onCancel={this.props.onCancelRequest}
            >
                <NewProjectForm {...this.props.newProjectFormProps} />
            </TexterifyModal>
        );
    }
}

export { NewProjectFormModal };
