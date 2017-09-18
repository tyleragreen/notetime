//const Source = require('../model').Source;
const Source = require('../model/Source');
const lineParser = require('./lineParser');

const DIGITS_REGEX = /\d/;
const parseSourceId = (line) => {
  return line.split(' ')[1].split('-')[0];
};

const sourceParser = (sourceLines) => {
  const sources = [];

  // First, filter out all simple sources
  const simpleSources = sourceLines.filter(line => {
    return line.split(' ')[1] === 'source';
  });
  simpleSources.forEach(source => {
    sources.push(new Source({
      id: source.split(' ')[2],
      url: source.split(' ')[3],
    }));
  });

  // Next, proceed with the complex sources
  const complexSources = sourceLines.filter(line => {
    return line.split(' ')[1] !== 'source';
  });

  if (complexSources.length > 0) {

    // TODO add 1- before each complex source tag without an identifier?
    // BUT how do you know they haven't used 1 as an identifier?
    // Maybe it's time to say 1 cannot be used as an identifier
    const firstSource = complexSources.filter(line => {
      return line.split(' ')[1].split('-')[0].match(/source/);
    })
    .reduce((acc, line) => {
      acc[line.split(' ')[1].split('-')[1]] = lineParser(line);
      return acc;
    }, {});
    sources.push(new Source(firstSource));

    const multiSource = complexSources.filter(line => {
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

    if (isMultiSource) {
      for (let sourceId in additionalSources) {
        sources.push(new Source(additionalSources[sourceId]));
      }
    }
  }

  return sources;
};

module.exports = sourceParser;
