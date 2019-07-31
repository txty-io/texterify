module.exports = {
  test: /\.less$/,
  use: [{
    loader: "style-loader" // creates style nodes from JS strings
  }, {
    loader: "css-loader" // translates CSS into CommonJS
  }, {
    loader: "less-loader", // compiles Less to CSS
    options: {
      modifyVars: {
        // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
        "primary-color": "#7977f3",
        "info-color": "#7977f3",
        "btn-primary-color": "#fff",
        "btn-primary-bg": "#7977f3",
        "font-family": "Open Sans",
        "layout-body-background": "#fff",
        "layout-header-background": "#fff",
        "btn-danger-border": "#f5222d",
        "btn-danger-bg": "#fff",
        "menu-item-color": "#333",
        "menu-item-active-bg": "#6772e526"
      },
      javascriptEnabled: true
    }
  }]
}
