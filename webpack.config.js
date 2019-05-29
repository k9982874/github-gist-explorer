//@ts-check

'use strict';

const path = require('path');

const webpack = require('webpack');

const TerserPlugin = require('terser-webpack-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');


/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node',

  entry: path.resolve(__dirname, './src/extension.ts'),

  node: {
    __dirname: false,
    __filename: false,
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },

  module: {
    rules: [{
      test: /\.ts$/,
      exclude: [
        /(\.d\.ts)/,
        path.join(__dirname, './web')
      ],
      loader: 'ts-loader',
      options: {
        configFile: path.join(__dirname, 'tsconfig.json'),
        transpileOnly: true
      }
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      $dirname: '__dirname',
    }),
    new TSLintPlugin({
      config: path.join(__dirname, 'tslint.json'),
      files: ['./src/**/*.ts']
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
