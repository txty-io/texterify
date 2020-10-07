const { environment } = require("@rails/webpacker");
const webpack = require("webpack");

const dotenv = require("dotenv");
const dotenvFiles = [".env-frontend.development"];
dotenvFiles.forEach((dotenvFile) => {
    dotenv.config({ path: dotenvFile, silent: true });
});
environment.plugins.insert("Environment", new webpack.EnvironmentPlugin(process.env));

const less = require("./loaders/less");
environment.loaders.append("less", less);

module.exports = environment;
