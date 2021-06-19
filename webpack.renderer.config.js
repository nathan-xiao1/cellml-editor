const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require("path");

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      Types: path.resolve(__dirname, 'src/types.d.ts'),
      IPCChannels: path.resolve(__dirname, 'src/main/handlers/IpcChannels.ts')
    },
  },
};
