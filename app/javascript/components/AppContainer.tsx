// tslint:disable-next-line:no-import-side-effect
import "antd/dist/antd.less";
import * as React from "react";
import { AppRouter } from "./routing/AppRouter";

interface IProps {
  specialHeaderMainSiteImageURL: string;
  specialHeaderFeaturesSiteImageURL: string;
}

interface IState { }

class AppContainer extends React.Component<IProps, IState> {
  render(): JSX.Element {
    return (
      <AppRouter />
    );
  }
}

// Export the app container per default because otherwise the
// component can't be rendered in the view by react-rails.
// tslint:disable-next-line:no-default-export
export default AppContainer;