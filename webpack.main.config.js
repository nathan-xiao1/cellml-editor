const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main/index.ts",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "node_modules/libcellml.js/libcellml.common.wasm"),
          to: path.resolve(".webpack/main"),
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json", ".scss"],
    alias: {
      Types: path.resolve(__dirname, "src/types.d.ts"),
      IPCChannels: path.resolve(__dirname, "src/main/handlers/IpcChannels.ts"),
      src: path.resolve(__dirname, "src"),
    },
  },
};
