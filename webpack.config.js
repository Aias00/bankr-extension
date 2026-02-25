const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  return {
    entry: {
      popup: path.resolve(__dirname, 'src/popup/index.tsx'),
      'service-worker': path.resolve(__dirname, 'src/background/service-worker.ts')
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true
    },
    devtool: isProd ? false : 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'src/popup/index.html'),
        filename: 'popup.html',
        chunks: ['popup']
      }),
      new MiniCssExtractPlugin({
        filename: 'popup.css'
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: path.resolve(__dirname, 'public'), to: path.resolve(__dirname, 'dist') }
        ]
      })
    ],
    optimization: {
      minimize: isProd
    }
  };
};
