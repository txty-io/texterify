import styled from "styled-components";
import { Styles } from "./Styles";

export const HoverCard = styled.div<{ selected?: boolean }>`
    cursor: pointer;
    border: 1px solid;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
    border-color: ${(props) => {
        return props.selected ? "var(--primary-btn-color)" : "var(--border-color)";
    }};

    &:hover {
        border-color: ${(props) => {
            return props.selected ? "var(--primary-btn-color)" : "var(--border-color-flashier)";
        }};
    }
`;
