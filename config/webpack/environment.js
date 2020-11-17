// eslint-disable-next-line @typescript-eslint/no-var-requires
const { environment } = require("@rails/webpacker");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require("webpack");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");
const dotenvFiles = [".env-frontend.development"];
dotenvFiles.forEach((dotenvFile) => {
    dotenv.config({ path: dotenvFile, silent: true });
});
environment.plugins.insert("Environment", new webpack.EnvironmentPlugin(process.env));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const less = require("./loaders/less");
environment.loaders.append("less", less);

module.exports = environment;
