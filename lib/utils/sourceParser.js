const Source = require('../model/Source');
const lineParser = require('./lineParser');

const sourceParser = (sourceLines) => {
  const firstSource = sourceLines.filter(line => {
    return line.split('-')[0].match(/source/);
  })
  .reduce((acc, line) => {
    acc[line.split(' ')[1].split('-')[1]] = lineParser(line);
    return acc;
  }, {});

  return [
    new Source(firstSource),
  ];
};

module.exports = sourceParser;
