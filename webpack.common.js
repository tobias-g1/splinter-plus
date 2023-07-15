const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const path = require('path');
const fs = require('fs');

const config = {
  entry: {
    background: './src/background/index.ts',
    combine: './src/content-scripts/combine/index.ts',
    username: './src/content-scripts/username/username.js',
    recommendation: './src/content-scripts/recommend-cards/index.ts',
    deck: './src/content-scripts/recommend-deck/index.ts',
    auth: './src/content-scripts/auth/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: { url: false },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /\.ts(x)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: 'file-loader',
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              mimetype: 'image/png',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.tsx', '.ts'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),
    new NodePolyfillPlugin(),
    new webpack.DefinePlugin({
      'process.env.KEYCHAIN_EXTENSION_ID': JSON.stringify(
        process.env.KEYCHAIN_EXTENSION_ID,
      ),
    }),
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('GenerateManifest', (compilation) => {
          const manifestPath = path.join(compiler.outputPath, 'manifest.json');
          const manifestTemplatePath = path.join(
            __dirname,
            'public',
            'manifest.json',
          );

          // Read the manifest template file
          const manifestTemplate = JSON.parse(
            fs.readFileSync(manifestTemplatePath, 'utf8'),
          );

          // Update the ids array with the KEYCHAIN_EXTENSION_ID
          manifestTemplate.externally_connectable.ids = [
            process.env.KEYCHAIN_EXTENSION_ID,
          ];

          // Write the updated manifest to the output directory
          fs.writeFileSync(
            manifestPath,
            JSON.stringify(manifestTemplate, null, 2),
          );
        });
      },
    },
  ],
  output: {
    path: path.join(__dirname, 'dist-dev'),
    filename: '[name]Bundle.js',
  },
};
module.exports = config;
