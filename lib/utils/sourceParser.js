const Source = require('../model').Source;
const lineParser = require('./lineParser');

const DIGITS_REGEX = /\d/;
const parseSourceId = (line) => {
  return line.split(' ')[1].split('-')[0];
};

const sourceParser = (sourceLines) => {
  const firstSource = sourceLines.filter(line => {
    return line.split(' ')[1].split('-')[0].match(/source/);
  })
  .reduce((acc, line) => {
    acc[line.split(' ')[1].split('-')[1]] = lineParser(line);
    return acc;
  }, {});

  const multiSource = sourceLines.filter(line => {
    return parseSourceId(line).match(DIGITS_REGEX);
  });
  const isMultiSource = multiSource.length > 0;

  // Create an object of sources beyond the first one
  // The props of this object are the sourceId (2-source-title has a user-defined sourceId of 2)
  const additionalSources = multiSource.reduce((acc, line) => {
    if (!acc[parseSourceId(line)]) {
      acc[parseSourceId(line)] = {};
    }
    acc[parseSourceId(line)][line.split(' ')[1].split('-')[2]] = lineParser(line);
    return acc;
  }, {});

  let sources = [
    new Source(firstSource),
  ];

  if (isMultiSource) {
    for (let sourceId in additionalSources) {
      sources.push(new Source(additionalSources[sourceId]));
    }
  }

  return sources;
};

module.exports = sourceParser;
