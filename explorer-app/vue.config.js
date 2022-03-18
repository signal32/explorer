const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
    configureWebpack: {
        plugins: [
            new NodePolyfillPlugin(),
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
/*    chainWebpack: config => {
        config.module
            .rule('sqparql')
            .test(/\.sparql$/i)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
    }*/
}