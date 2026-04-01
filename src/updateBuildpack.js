const { loadConfig, writeConfig } = require('./config');

function updateBuildpack({ cwd, nodeVersion }) {
  const config = loadConfig(cwd);
  config.buildpack = config.buildpack || {};
  config.buildpack.node = nodeVersion;
  writeConfig(cwd, config);
  return config.buildpack.node;
}

module.exports = { updateBuildpack };
