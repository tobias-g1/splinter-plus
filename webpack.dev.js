const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const dotenv = require('dotenv');
const { DefinePlugin } = require('webpack');
const TransformJson = require('transform-json-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist-dev',
  },
  output: {
    path: path.join(__dirname, 'dist-dev'),
    filename: '[name]Bundle.js',
  },
  plugins: [
    new DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed),
    }),
    new TransformJson({
      // json configuration
      filename: 'dist-dev/manifest.json',
      object: {
        externally_connectable: {
          ids: [dotenv.config().parsed.KEYCHAIN_EXTENSION_ID],
          matches: ['https://localhost:3000/*', 'http://localhost:3000/*'],
          accepts_tls_channel_id: false,
        },
      },
      source: 'public/manifest.json',
    }),
  ],
});
