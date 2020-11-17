process.env.NODE_ENV = process.env.NODE_ENV || "development";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const environment = require("./environment");

module.exports = environment.toWebpackConfig();
