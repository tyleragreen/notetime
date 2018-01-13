const fs = require('fs');

const name = 'config.json'

// Because this module uses require(..), the results
// will be cached internally and not reloaded on each call.
// TODO maybe fix this.
const readConfig = () => {
  const path = process.env.NODE_CONFIG_DIR ? `${process.cwd()}/${process.env.NODE_CONFIG_DIR}/${name}` : `${process.cwd()}/${name}`;
  return require(path);
};

module.exports = readConfig();
