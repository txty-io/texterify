import * as React from "react";
import { Modal } from "antd";
import { ModalProps } from "antd/lib/modal";
import { CloseCircleFilled } from "@ant-design/icons";

export function TexterifyModal(props: ModalProps & { children: React.ReactNode; big?: boolean }) {
    const { children, ...rest } = props;

    return (
        <Modal
            width={props.big ? 1200 : undefined}
            destroyOnClose
            maskClosable={false}
            closeIcon={<CloseCircleFilled />}
            {...rest}
        >
            {children}
        </Modal>
    );
}
