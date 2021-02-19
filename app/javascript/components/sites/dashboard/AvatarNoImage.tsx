import * as React from "react";
import styled from "styled-components";
import { AvatarWrapper } from "./AvatarWrapper";

const Container = styled.div`
    width: 160px;
    height: 160px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: rgba(255, 255, 255, 0.65);

    ${AvatarWrapper}:hover & {
        color: rgba(255, 255, 255, 0.75);
    }
`;

export function AvatarNoImage() {
    return <Container>Drop your image or click to select one.</Container>;
}
