const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const DEVELOPMENT = process.env.NODE_ENV == "development";

console.log(`: NODE_ENV=${process.env.NODE_ENV} DEVELOPMENT=${DEVELOPMENT}`);

const ROOT_PATH = DEVELOPMENT ? "" : "main_window"

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, "node_modules/monaco-editor/min/vs"),
        to: path.resolve(__dirname, ".webpack/renderer", ROOT_PATH, "vs"),
      },
      DEVELOPMENT && {
        from: path.resolve(__dirname, "node_modules/monaco-editor/min/vs"),
        to: path.resolve(__dirname, "vs"),
      },
      {
        from: path.resolve(__dirname, "node_modules/pdfjs-dist/build/pdf.worker.min.js"),
        to: path.resolve(__dirname, ".webpack/renderer", ROOT_PATH),
      },
      {
        from: path.resolve(__dirname, "node_modules/pdfjs-dist/build/pdf.worker.js"),
        to: path.resolve(__dirname, ".webpack/renderer", ROOT_PATH),
      },
      {
        from: path.resolve(__dirname, "src", "static"),
        to: path.resolve(__dirname, ".webpack/renderer", ROOT_PATH, "static"),
      },
      {
        from: path.resolve(__dirname, "formulaeditor-1.1.36e"),
        to: path.resolve(__dirname, ".webpack/renderer", ROOT_PATH),
      },
    ].filter(Boolean),
  }),
];
