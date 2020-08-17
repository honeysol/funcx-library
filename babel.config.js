module.exports = {
  presets: [
    ["@babel/preset-react"],
    ["@babel/preset-env", {}],
    ["@babel/preset-flow"],
  ],
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "@babel/plugin-proposal-optional-chaining",
  ],
};
