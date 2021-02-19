import styled from "styled-components";
import { Styles } from "../../ui/Styles";

export const AvatarWrapper = styled.div`
    display: flex;
    flex-direction: column;
    border-radius: ${Styles.DEFAULT_BORDER_RADIUS}px;
    border: 1px solid var(--border-color);

    &:hover {
        border-color: var(--border-color-flashier);
    }
`;
