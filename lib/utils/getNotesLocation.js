const defaultNotePath = require('./constants').defaultNotePath;

const getNotesLocation = (config) => {
  return config.path || defaultNotePath;
}

module.exports = getNotesLocation;
