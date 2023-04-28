import styled from "styled-components";
import { Styles } from "./Styles";

export const HoverCard = styled.div<{ selected?: boolean }>`
    cursor: pointer;
    border: 1px solid;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
    border-color: ${(props) => {
        return props.selected ? "var(--color-primary-500)" : "var(--color-border)";
    }};

    &:hover {
        border-color: ${(props) => {
            return props.selected ? "var(--color-primary-500)" : "var(--color-border-flashier)";
        }};
    }
`;
