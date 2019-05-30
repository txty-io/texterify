import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";

type IProps = RouteComponentProps<{}> & {};
interface IState {
  lastLocation: any;
}

class RoutingManagerUnwrapped extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      lastLocation: this.props.location
    };
  }

  componentDidMount(): void {
    this.props.history.listen((location: any, action: any) => {
      if (location !== this.state.lastLocation) {
        console.log(`%cSwitching url to "${location.pathname}${location.search}${location.hash}" by action ${action}.`, "background: #eee; color: #666;");
        this.setState({
          lastLocation: location
        });
      }
    });
  }

  render(): JSX.Element {
    return (
      <>{this.props.children}</>
    );
  }
}

const RoutingManager: any = withRouter(RoutingManagerUnwrapped);

export { RoutingManager };
