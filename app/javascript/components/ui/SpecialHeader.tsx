import * as React from "react";
import { ContentWrapper } from "./PrimitiveComponents";
import { TopBar } from "./TopBar";

interface IProps {
  backgroundImageURL: string;
  Header: any;
}
interface IState { }

class SpecialHeader extends React.Component<IProps, IState> {
  render(): JSX.Element {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundImage: `url(${this.props.backgroundImageURL})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "50% 50%"
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(rgba(133, 75, 163, 0.85) 0%, rgba(69, 55, 149, 0.85) 100%)"
          }}
        >
          <TopBar white />
          <ContentWrapper>
            {this.props.Header}
          </ContentWrapper>
        </div>
      </div>
    );
  }
}

export { SpecialHeader };
