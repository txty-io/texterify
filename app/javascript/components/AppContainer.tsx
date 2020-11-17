import * as React from "react";
import "../../assets/stylesheets/externals/antd-dark.less";
import "../../assets/stylesheets/externals/antd.less";
import { AppRouter } from "./routing/AppRouter";
import "mobx-react-lite/batchingForReactDom";

function setFavicon(type: "dark" | "light") {
    const darkModeIconLink = document.querySelector<HTMLLinkElement>('link[rel="dark-mode-icon"]');
    const lightModeIconLink = document.querySelector<HTMLLinkElement>('link[rel="light-mode-icon"]');
    const realIconLink = document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]');

    if (type === "dark") {
        realIconLink.href = darkModeIconLink.href;
    } else if (type === "light") {
        realIconLink.href = lightModeIconLink.href;
    }
}

class AppContainer extends React.Component {
    componentDidMount() {
        if (!window.matchMedia) {
            return;
        }

        const dark = window.matchMedia("(prefers-color-scheme: dark)");

        if (dark.matches) {
            setFavicon("dark");
        } else {
            setFavicon("light");
        }

        dark.addEventListener("change", (e) => {
            if (e.matches) {
                setFavicon("dark");
            } else {
                setFavicon("light");
            }
        });
    }

    render() {
        return <AppRouter />;
    }
}

// Export the app container per default because otherwise the
// component can't be rendered in the view by react-rails.
export default AppContainer;
