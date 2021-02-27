import * as React from "react";
import styled from "styled-components";
import { AvatarWrapper } from "./AvatarWrapper";

const Container = styled.div`
    width: 100%;
    height: 100%;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--color-passive);

    ${AvatarWrapper}:hover & {
        color: var(--color-passive-hover);
    }
`;

export function AvatarNoImage() {
    return <Container>Drop your image or click to select one.</Container>;
}
