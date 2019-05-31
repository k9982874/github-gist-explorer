//@ts-check

'use strict';

const path = require('path');

const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');

/**@type {import('webpack').Configuration}*/
const config = {
  mode: 'none',
  target: 'node',
  entry: path.resolve(__dirname, './src/extension.ts'),
  output: {
    filename: 'extension.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: "commonjs",
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    mainFields: ['module', 'main'],
    extensions: ['.ts', '.js']
  },
  node: {
    __dirname: false,
    __filename: false,
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
    new webpack.DefinePlugin({
      $dirname: '__dirname',
    })
  ]
};

module.exports = function (env, argv) {
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
  }
  return config;
}
