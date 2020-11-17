process.env.NODE_ENV = process.env.NODE_ENV || "production";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const environment = require("./environment");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

environment.plugins.append(
    "sentry",
    new SentryWebpackPlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: process.env.SENTRY_ORGANIZATION_BACKEND,
        project: process.env.SENTRY_PROJECT_BACKEND,
        include: ["app/javascript", "public/assets"],
        ignore: ["node_modules", "webpack.config.js", "vendor"],
        errorHandler: (err, invokeErr, compilation) => {
            compilation.warnings.push("Sentry CLI Plugin: " + err.message);
        },
        release: process.env.COMMIT_HASH
    })
);

module.exports = environment.toWebpackConfig();
