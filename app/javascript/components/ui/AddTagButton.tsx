import { PlusOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import * as React from "react";
import styled from "styled-components";

const TagWrapper = styled.div`
    opacity: 0.5;
    cursor: pointer;

    &:hover {
        opacity: 1;
    }
`;

export function AddTagButton(props: { onClick(): void }) {
    return (
        <TagWrapper>
            <Tag onClick={props.onClick}>
                <PlusOutlined /> Add tag
            </Tag>
        </TagWrapper>
    );
}
