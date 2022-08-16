import { Button } from "antd";
import styled from "styled-components";

const TransparentButton = styled(Button)`
    &&&&&& {
        color: #fff;
        border-color: #fff;
        background: transparent;

        &:hover {
            border-color: #fff !important;
            background: rgba(255, 255, 255, 0.2) !important;
        }
    }
`;

export { TransparentButton };
