const fs = require('fs');

const readConfigAsync = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('.noterc', 'utf-8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

module.exports = readConfigAsync;
