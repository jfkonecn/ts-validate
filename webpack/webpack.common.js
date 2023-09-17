/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  entry: "./src/index.ts", // Entry point of your application
  target: "node", // Target Node.js environment
  output: {
    filename: "index.js", // Output file name
    path: path.resolve(__dirname, "..", "build"), // Output directory
  },
  resolve: {
    extensions: [".ts", ".js"], // Resolve both TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      extensions: ["ts"],
    }),
  ],
};
