const lineParser = (line) => {
  return line.split(' ').slice(2).join(' ');
};

module.exports = lineParser;
