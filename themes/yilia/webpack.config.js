/*
 * @Description: 
 * @Autor: wwh
 * @Date: 2020-07-01 13:29:58
 * @LastEditors: wwh
 * @LastEditTime: 2020-07-08 12:47:04
 */

const webpack = require("webpack");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// 模板压缩
// 详见：https://github.com/kangax/html-minifier#options-quick-reference

const minifyHTML = {
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  minifyJS: true
}

module.exports = {
  entry: {
    main: "./source-src/js/main.js",
    slider: "./source-src/js/slider.js",
    mobile: ["babel-polyfill", "./source-src/js/mobile.js"]
  },
  output: {
    path: path.resolve(__dirname, "./source"),
    publicPath: "./",
    filename: "[name].[chunkhash:6].js"
  },
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader?cacheDirectory',
      exclude: /node_modules/
    },
    {
      test: /\.html$/,
      loader: 'html'
    }, {
      test: /\.(scss|sass|css)$/,
      loader: ExtractTextPlugin.extract('style-loader', ['css-loader?-autoprefixer', 'postcss-loader', 'sass-loader'])
    }, {
      test: /\.(gif|jpg|png)\??.*$/,
      loader: 'url-loader?limit=500&name=img/[name].[ext]'
    }, {
      test: /\.(woff|svg|eot|ttf)\??.*$/,
      loader: "file-loader?name=fonts/[name].[hash:6].[ext]"
    }]
  },
  // alias: {
  //   'vue$': 'vue/dist/vue.js'
  // },
  // resolve: {
  //   alias: {
  //     'vue$': 'vue/dist/vue.common.js'
  //   }
  // },
  // devtool: '#eval-source-map',
  // postcss: function() {
  //   return [autoprefixer];
  // },
  plugins: [
    new ExtractTextPlugin('[name].[chunkhash:6].css'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      cache: false,
      minify: minifyHTML,
      template: './source-src/script.ejs',
      filename: '../layout/_partial/script.ejs'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      cache: false,
      minify: minifyHTML,
      template: './source-src/css.ejs',
      filename: '../layout/_partial/css.ejs'
    })
  ],
  watch: true
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new CleanPlugin('builds')
  ])
}