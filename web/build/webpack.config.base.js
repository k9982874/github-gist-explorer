'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const utils = require('./utils')

module.exports = {
  entry: utils.resolve('src/index.ts'),

  output: {
    path: utils.resolve('../media')
  },

  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'assets': utils.resolve('assets'),
      'pages': utils.resolve('src/pages'),
      'static': utils.resolve('static'),
      'components': utils.resolve('src/components')
    }
  },

  module: {
    rules: [{
      test: /\.vue$/,
      use: 'vue-loader'
    }, {
      test: /\.ts$/,
      exclude: [/(\.d\.ts)/],
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
        appendTsSuffixTo: [/\.vue$/]
      }
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      }
    }, {
      test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      }
    }, {
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      }
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    }]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template:  utils.resolve('index.html'),
      inject: true
    }),
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([{
      from: utils.resolve('static/img'),
      to: utils.resolve('../media/static/img'),
      toType: 'dir'
    }])
  ]
}
