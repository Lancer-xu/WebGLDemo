const webpack = require('webpack')

module.exports = {
  devtool: 'cheap-module-eval-source-map',

  entry: {
    index: [
      'babel-polyfill',
      'webpack/hot/only-dev-server',
      './src/index.js',
    ],
  },

  output: {
    path: './build',
    filename: '[name].bundle.js',
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot-loader/webpack', 'babel-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loader: 'style!css!sass?sourceMap'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader' 
      },
      {
        test: /\.mp3$/,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
        ]
      },
      {
        test: /\.less$/,
        loader: 'style-loader!css-loader!less-loader'
      }
    ]
  },

  // eslint: {
  //   configFile: '.eslintrc',
  // },

  devServer: {
    progress: true,
    colors: true,
    contentBase: './statics',
    port: 3001,
    host: '0.0.0.0',
  },
}
