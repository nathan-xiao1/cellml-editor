const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const DEVELOPMENT = process.env.NODE_ENV == "development";

console.log(`: NODE_ENV=${process.env.NODE_ENV} DEVELOPMENT=${DEVELOPMENT}`);

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({
    patterns: [
      !DEVELOPMENT && {
        from: path.resolve(__dirname, "node_modules/monaco-editor/min/vs"),
        to: path.resolve(__dirname, ".webpack/renderer/main_window", "vs"),
      },
      DEVELOPMENT && {
        from: path.resolve(__dirname, "node_modules/monaco-editor/min/vs"),
        to: path.resolve(__dirname, ".webpack/renderer", "vs"),
      },
      DEVELOPMENT && {
        from: path.resolve(__dirname, "node_modules/monaco-editor/min/vs"),
        to: path.resolve(__dirname, "vs"),
      },
    ].filter(Boolean),
  }),
];
