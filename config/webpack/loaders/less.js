module.exports = {
    test: /\.less$/,
    use: [
        {
            loader: "style-loader" // creates style nodes from JS strings
        },
        {
            loader: "css-loader" // translates CSS into CommonJS
        },
        {
            loader: "less-loader", // compiles Less to CSS
            options: {
                lessOptions: {
                    modifyVars: {
                        // https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
                        "primary-color": "#4170ff",
                        "info-color": "#4170ff",
                        "layout-body-background": "#fff",
                        "layout-header-background": "#fff",
                        "menu-item-color": "#333"
                    },
                    javascriptEnabled: true
                }
            }
        }
    ]
};
