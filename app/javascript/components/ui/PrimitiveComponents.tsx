import styled from "styled-components";

const ContentWrapper: any = styled.div`
  padding: 40px 0;
  flex-grow: 1;
  width: 100%;
  max-width: 400px;
  margin: auto;
  display: flex;
`;

const FlexExpandVertical: any = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
`;

export { ContentWrapper, FlexExpandVertical };
