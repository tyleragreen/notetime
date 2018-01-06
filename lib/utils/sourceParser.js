const Source = require('../model/Source');
const lineParser = require('./lineParser');

const parseSourceId = (line) => {
  const id = parseInt(line.split(' ')[1].split('-')[0]);

  if (isNaN(id)) {
    throw new Error(`No source id for line: ${line}.`);
  }

  return id;
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
    // Create an object of sources beyond the first one
    // The props of this object are the sourceId (2-source-title has a user-defined sourceId of 2)
    const additionalSources = complexSources.reduce((acc, line) => {
      if (!acc[parseSourceId(line)]) {
        acc[parseSourceId(line)] = {};
      }
      acc[parseSourceId(line)][line.split(' ')[1].split('-')[2]] = lineParser(line);
      return acc;
    }, {});

    for (let sourceId in additionalSources) {
      sources.push(new Source(additionalSources[sourceId]));
    }
  }

  return sources;
};

module.exports = sourceParser;
