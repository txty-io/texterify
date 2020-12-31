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

        const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");

        if (matchMedia) {
            if (matchMedia.matches) {
                setFavicon("dark");
            } else {
                setFavicon("light");
            }

            const onChangeFunction = (e) => {
                if (e.matches) {
                    setFavicon("dark");
                } else {
                    setFavicon("light");
                }
            };

            if (matchMedia.addEventListener) {
                matchMedia.addEventListener("change", onChangeFunction);
            } else if (matchMedia.addListener) {
                // needed for Safari
                matchMedia.addListener(onChangeFunction);
            }
        }
    }

    render() {
        return <AppRouter />;
    }
}

// Export the app container per default because otherwise the
// component can't be rendered in the view by react-rails.
export default AppContainer;
