import "mobx-react-lite/batchingForReactDom";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import "../../assets/stylesheets/externals/antd-dark.less";
import "../../assets/stylesheets/externals/antd-light.less";
import "../../assets/stylesheets/externals/antd.less";
import { AppRouter } from "./routing/AppRouter";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false
        }
    }
});

class AppContainer extends React.Component {
    render() {
        return (
            <QueryClientProvider client={queryClient}>
                <AppRouter />
                {/* <ReactQueryDevtools initialIsOpen /> */}
            </QueryClientProvider>
        );
    }
}

// Export the app container per default because otherwise the
// component can't be rendered in the view by react-rails.
export default AppContainer;
