//@ts-check

'use strict';

const webpack = require('webpack');

const path = require('path');

const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/**@type {import('webpack').Configuration}*/
const config = {
  mode: 'none',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: path.resolve(__dirname, './src/extension.ts'),
  output: {
    filename: 'extension.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'commonjs'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: [
        /(\.d\.ts)/,
        path.join(__dirname, 'web')
      ],
      loader: 'ts-loader',
      options: {
        configFile: path.join(__dirname, 'tsconfig.json')
      }
    }]
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
};

module.exports = function (env, argv) {
  const pluginDefinitions = {
    $dirname: '__dirname',
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.ASSET_PATH': JSON.stringify(process.env.ASSET_PATH || '../../resources')
  };

  if (argv.mode === 'production') {
    config.devtool = false;

    config.optimization = {
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          exclude: /\/src/
        })
      ]
    };

    pluginDefinitions['process.env.NODE_ENV'] = JSON.stringify('production');
  }

  config.plugins.push(new webpack.DefinePlugin(pluginDefinitions));

  return config;
}
