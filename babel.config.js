module.exports = function (api) {
  var validEnv = ['development', 'test', 'production']
  var currentEnv = api.env()
  var isDevelopmentEnv = api.env('development')
  var isProductionEnv = api.env('production')
  var isTestEnv = api.env('test')

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      'Please specify a valid `NODE_ENV` or ' +
      '`BABEL_ENV` environment variables. Valid values are "development", ' +
      '"test", and "production". Instead, received: ' +
      JSON.stringify(currentEnv) +
      '.'
    )
  }

  return {
    presets: [
      isTestEnv && [
        require('@babel/preset-env').default,
        {
          targets: {
            node: 'current'
          }
        }
      ],
      (isProductionEnv || isDevelopmentEnv) && [
        require('@babel/preset-env').default,
        {
          forceAllTransforms: true,
          useBuiltIns: 'entry',
          modules: false,
          corejs: "3.0.0",
          exclude: ['transform-typeof-symbol']
        }
      ],
      ['@babel/preset-typescript', { 'allExtensions': true, 'isTSX': true }],
      ['@babel/preset-react']
    ].filter(Boolean),
    plugins: [
      require('babel-plugin-macros'),
      require('@babel/plugin-syntax-dynamic-import').default,
      isTestEnv && require('babel-plugin-dynamic-import-node'),
      require('@babel/plugin-transform-destructuring').default,
      ["@babel/plugin-proposal-decorators", { "legacy": true }],
      ["@babel/plugin-proposal-class-properties", { "loose": true }],
      ["@babel/plugin-proposal-private-methods", { "loose": true }],
      ["@babel/plugin-proposal-private-property-in-object", { "loose": true }],
      [
        require('@babel/plugin-proposal-object-rest-spread').default,
        {
          useBuiltIns: true
        }
      ],
      [
        require('@babel/plugin-transform-runtime').default,
        {
          helpers: false,
          regenerator: true
        }
      ],
      [
        require('@babel/plugin-transform-regenerator').default,
        {
          async: false
        }
      ],
      [require("babel-plugin-module-resolver").default, {
        "root": ["./app"],
        "alias": {
          "assets": "./assets"
        }
      }]
    ].filter(Boolean)
  }
}
