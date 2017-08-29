const glob = require('glob');
const supportedExtensions = require('./constants').supportedExtensions;

glob(`*.*(${supportedExtensions.join('|')})`, (err, files) => {
  if (err) throw err;

  console.log('files', files);
});
