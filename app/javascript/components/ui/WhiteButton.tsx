import styled from "styled-components";
import { Button } from "antd";

export const WhiteButton = styled(Button)`
    &&& {
        background: transparent;
        color: #fff;
        overflow: hidden;
        text-overflow: ellipsis;
        border: 1px solid rgba(255, 255, 255, 1);
        transition: none;
    }
`;
