const path = require('path');
const { ProgressPlugin } = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');

const dist = path.resolve(__dirname, 'dist');
const isDevelopment = process.env.NODE_ENV !== 'production';
const inServe = process.env.NODE_ENV === 'SERVE';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    main: './src/main.tsx',
    devtools: './src/devtools.ts',
    background: './src/background.ts',
    content: './src/content.ts'
  },
  output: {
    filename: pd => {
      const name = pd.chunk.name;
      switch (name) {
        case 'main':
          return 'js/main.[chunkhash:4].js';
        default:
          return '[name].js';
      }
    },
    path: dist,
    library: {
      type: 'umd'
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: () => ({
            before: inServe ? [ReactRefreshTypeScript()] : []
          }),
          transpileOnly: inServe
        }
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        options: {
          name: '[chunkhash:6].[ext]',
          limit: 2048,
          outputPath: 'images',
          esModule: false
        }
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ProgressPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        'manifest.json',
        { from: './src/assets/icon.png', to: 'assets/icon.png' },
        { from: './src/assets/devtools.html', to: 'assets/devtools.html' }
      ]
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      chunks: ['main']
    }),
    inServe && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  devServer: {
    contentBase: [dist],
    port: 10090,
    hot: true,
    open: false,
    historyApiFallback: true
  },
  performance: {
    maxEntrypointSize: 10240000,
    maxAssetSize: 10240000
  },
  stats: {
    timings: true,
    builtAt: true,
    modules: false
  },
  devtool: false
};
