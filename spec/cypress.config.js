// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("cypress");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const getCompareSnapshotsPlugin = require("cypress-image-diff-js/dist/plugin");

module.exports = defineConfig({
    defaultCommandTimeout: 10000,
    video: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    e2e: {
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            getCompareSnapshotsPlugin(on, config);

            // eslint-disable-next-line @typescript-eslint/no-var-requires
            return require("./cypress/plugins/index.js")(on, config);
        },
        baseUrl: "http://localhost:3000"
    },
    watchForFileChanges: false
});
