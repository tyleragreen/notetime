const glob = require('glob');
const fs = require('fs');
const supportedExtensions = require('./constants').supportedExtensions;

const readFileAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

glob(`*.*(${supportedExtensions.join('|')})`, (err, files) => {
  if (err) throw err;

  files.forEach(async (filepath) => {
    const contents = await readFileAsync(filepath);
    console.log('contents', contents);
  });

  console.log('files', files);
});
