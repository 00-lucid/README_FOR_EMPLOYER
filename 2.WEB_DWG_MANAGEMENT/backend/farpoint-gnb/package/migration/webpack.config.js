const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { resolve } = require('path')

module.exports = function (env, argv) {
    const config = {
        plugins: [new CleanWebpackPlugin()],
        entry: './src/index.ts',
        externals: [
            nodeExternals(),
            {
                vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
            }
        ],
        output: {
            path: resolve(__dirname, 'output/bin'),
            filename: 'index.js',
            libraryTarget: 'commonjs2',
            devtoolModuleFilenameTemplate: '../../[resource-path]'
        },
        target: 'node',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader'
                    }
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js'],
            symlinks: true
        }
    }

    if (argv.mode === 'development') {
        config.devtool = 'inline-cheap-module-source-map'
    }

    return config
}
