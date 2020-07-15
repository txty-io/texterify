import * as React from "react";
import { Modal } from "antd";
import { ModalProps } from "antd/lib/modal";
import { CloseCircleFilled } from "@ant-design/icons";

export function TexterifyModal(props: ModalProps & { children: React.ReactNode }) {
    const { children, ...rest } = props;

    return (
        <Modal destroyOnClose maskClosable={false} closeIcon={<CloseCircleFilled />} {...rest}>
            {children}
        </Modal>
    );
}
