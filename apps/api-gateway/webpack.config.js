const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const path = require("path");
const { join } = require("path");

module.exports = {
  output: {
    path: join(__dirname, "dist"),
  },
  resolve: {
    alias: {
      "@packages": path.resolve(__dirname, "../../packages"),
    },
    extensions: [".ts", ".js"],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: "node",
      compiler: "tsc",
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      assets: ["./src/assets"],
      optimization: false,
      outputHashing: "none",
      generatePackageJson: true,
    }),
  ],
}; 
