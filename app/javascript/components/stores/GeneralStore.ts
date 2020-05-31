import * as localforage from "localforage";
import { observable, reaction, computed } from "mobx";
import { persist, create } from "mobx-persist";

class GeneralStore {
    @persist @observable theme: "dark" | "light";
    @observable hydrationFinished = false;
    @observable themeSet = false;

    constructor() {
        reaction(
            () => {
                return this.theme;
            },
            (theme) => {
                document.documentElement.style.setProperty("--theme", theme);

                if (theme === "light") {
                    document.documentElement.setAttribute("class", "no-transition");
                } else {
                    document.documentElement.setAttribute("class", "no-transition dark-theme");
                }

                this.themeSet = true;
            }
        );
    }

    @computed get hasLoaded() {
        return this.hydrationFinished && this.themeSet;
    }
}

// Persist this mobx state through localforage.
const hydrate = create({
    storage: localforage
});

const generalStore: GeneralStore = new GeneralStore();

hydrate("generalStore", generalStore)
    .then(() => {
        console.log("[GeneralStore] Hydrated from store successfully.");

        if (!generalStore.theme) {
            if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
                generalStore.theme = "dark";
            } else {
                generalStore.theme = "light";
            }
        }

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            console.log("[GeneralStore] Theme change detected.");
            generalStore.theme = e.matches ? "dark" : "light";
        });

        generalStore.hydrationFinished = true;
    })
    .catch((error: any) => {
        console.error("[GeneralStore] Error while hydrating:", error);
        generalStore.hydrationFinished = true;
    });

export { generalStore };
