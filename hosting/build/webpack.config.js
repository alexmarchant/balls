const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, '..', 'js', 'bundle.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '..', 'public'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
        },
      }, {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'babel-preset-env',
              'babel-preset-stage-3',
            ]
          }
        }
      }, {
				test: /\.css$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }]
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'Balls',
    template: path.resolve(__dirname, '..', 'html', 'index.ejs'),
  })],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  devtool: 'inline-source-map',
}

