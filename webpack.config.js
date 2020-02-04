var webpack = require("webpack");
var path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");

const PATHS = {
  src: path.join(__dirname, "./app"),
  dist: path.join(__dirname, "./dist")
};

module.exports = {
  mode: "development",
  entry: {
    app: [PATHS.src]
  },
  output: {
    path: PATHS.dist,
    filename: "bundle.js"
  },
  devServer: {
    // contentBase: __dirname,
    hot: true, // hot module replacement while application running
    inline: true, // a script inserted in bundle for live reloading
    progress: true, // output running progress to console.
    disableHostCheck: true, //bypasses host checking
    open: true, // open the browser after server started
    stats: { colors: true }, //whether to output in the different colors
    watchOptions: { poll: true }, //watching file changes use polling
    // writeToDisk: true, //whether output bundle.js, vender.bundle.js, and index.html
    // host: "0.0.0.0",
    port: 7000
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "all",
          enforce: true
        }
      }
    }
  },
  resolve: {
    extensions: [".js", ".jsx", "css"]
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loaders: ["style-loader"]
      },
      {
        // transpile es6/jsx code to es5
        test: /\.(js|jsx)$/, //which we are going to transform
        exclude: /node_modules/, // which path should be ignored when transforming modules
        // loaders: ["babel-loader"]
        use: {
          // "use": main rule's option
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"] //set default presets for Babel to consider which ES6 features it should transform and which not
          }
        }
      }
    ]
  },

  plugins: [
    new HtmlWebPackPlugin({
      template: "./app/index.html",
      path: PATHS.dist,
      filename: "index.html"
    })
  ]
};
