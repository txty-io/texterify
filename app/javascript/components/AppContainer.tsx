import * as React from "react";
import "../../assets/stylesheets/externals/antd-dark.less";
import "../../assets/stylesheets/externals/antd.less";
import { AppRouter } from "./routing/AppRouter";

class AppContainer extends React.Component {
    render() {
        return <AppRouter />;
    }
}

// Export the app container per default because otherwise the
// component can't be rendered in the view by react-rails.
export default AppContainer;
