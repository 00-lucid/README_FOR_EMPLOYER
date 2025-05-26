const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');

function resolvePath(dir) {
  return path.join(__dirname, '..', dir);
}

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';



module.exports = {
  mode: env,
  target: env === "development" ? "web" : "browserslist",
  entry: {
    app: './src/js/app.js',
  },
  output: {
    path: resolvePath('www'),
    filename: 'js/[name].[hash].js',
    chunkFilename: 'js/[name].[hash].js',
    publicPath: '',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolvePath('src'),
    },

  },
  devtool: env === 'production' ? 'source-map' : 'eval',
  devServer: {
    hot: true,
    open: true,
    compress: true,
    contentBase: '/www/',
    disableHostCheck: true,
    historyApiFallback: true,
  },
  optimization: {
    concatenateModules: true,
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js|jsx)$/,
        include: [
          resolvePath('src'),

        ],
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: env === 'development' ? {
              plugins: [
                require.resolve('react-refresh/babel'),
              ]
            } : {}
          },
        ]
      },



      {
        test: /\.css$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.styl(us)?$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'stylus-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'less-loader',
        ],
      },
      {
        test: /\.(sa|sc)ss$/,
        use: [
          (env === 'development' ? 'style-loader' : {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          }),
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'images/[name].[ext]',

        },
        type: 'javascript/auto'
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac|m4a)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[ext]',

        },
        type: 'javascript/auto'
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]',

        },
        type: 'javascript/auto'
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env),
      'process.env.TARGET': JSON.stringify(target),
    }),

    ...(env === 'production' ? [
      new CssMinimizerPlugin(),
    ] : [
      // Development only plugins
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshWebpackPlugin(),
    ]),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './src/index.html',
      inject: true,
      minify: env === 'production' ? {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false,
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          noErrorOnMissing: true,
          from: resolvePath('src/static'),
          to: resolvePath('www/static'),
        },
      ],
    }),
    new Dotenv({  
      path: './.env.'+ env, // load this now instead of the ones in '.env'
      safe: true, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
      allowEmptyValues: true, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
      systemvars: true, // load all the predefined 'process.env' variables which will trump anything local per dotenv specs.
      silent: true, // hide any errors
      defaults: false // load '.env.defaults' as the default values if empty.
    }),
  ],
};