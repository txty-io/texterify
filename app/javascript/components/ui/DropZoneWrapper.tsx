import styled from "styled-components";

export const DropZoneWrapper = styled.div`
    width: 100%;
    height: 128px;
    border: 1px dashed var(--input-border-color);
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin-top: 8px;
    outline: none;
    cursor: ${(props) => {
        return props.disabled ? "not-allowed" : "grab";
    }};

    &:hover {
        border-color: ${(props) => {
            return props.disabled ? "var(--input-border-color)" : "var(--input-border-hover-color)";
        }};
    }
`;
