const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require('webpack');

module.exports = {
    configureWebpack: {
        plugins: [
            new NodePolyfillPlugin(),
            new webpack.DefinePlugin({
                __VERSION__: JSON.stringify(process.env.npm_package_version),
                __DATE__: JSON.stringify(`${new Date().getDate()}/${new Date().getMonth()}/${new Date().getFullYear()}  ${new Date().getHours()}:${new Date().getMinutes()}`)
            })
        ],
        module: {
            rules: [
                {
                    test: /\.sparql$/i,
                    use: 'raw-loader',
                },
            ],
        },
    },
}