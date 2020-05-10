import styled from "styled-components";
import { Button } from "antd";

export const WhiteButton = styled(Button)`
    background: #000;
    color: rgba(255, 255, 255, 0.95);
    overflow: hidden;
    text-overflow: ellipsis;
    border: 1px solid rgba(255, 255, 255, 1);
    transition: none;

    &:hover {
        border: 1px solid rgba(255, 255, 255, 1);
        background: rgba(255, 255, 255, 0.25);
        color: #fff;
    }
`;
