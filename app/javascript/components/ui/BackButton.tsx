import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const StyledLink = styled(Link)`
    color: var(--breadcrumbs-color);
    align-self: flex-start;

    &:hover {
        color: var(--breadcrumbs-color-last);
    }
`;

export function BackButton(props: { route: string }) {
    return (
        <StyledLink to={props.route} style={{ marginBottom: 16 }}>
            Back to imports
        </StyledLink>
    );
}
