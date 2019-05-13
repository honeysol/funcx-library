const importAll = context => {
  const modules = {};
  for (const key of context.keys()) {
    const match = key.match(/\.\/([a-zA-Z]+)\.js$/);
    if (match) {
      const name = match[1];
      if (name !== "index") {
        modules[name] = context(key);
      }
    }
  }
  return modules;
};
/* global require */
const webPackContext = require.context("./", true, /^.\/([a-zA-Z]+)\.js$/);
const modules = importAll(webPackContext);

module.exports = modules;
