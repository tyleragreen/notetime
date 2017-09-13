const fs = require('fs');
const Note = require('../model/note');
const readline = require('readline');

const readNote = (path) => {
  return new Promise((resolve, reject) => {
    const body = [];
    const meta = [];
    const lineReader = readline.createInterface({
      input: fs.createReadStream(path),
    });
    
    lineReader.on('line', (line) => {
      if (line[0] === ';') {
        meta.push(line);
      } else {
        body.push(line);
      }
    });

    lineReader.on('close', () => {
      const note = new Note(path, meta, body);
      resolve(note);
    });

    // Looks like readline doesn't emit an error event?
    // TODO figure out when to send Promise.reject
    //lineReader.on('error', (err) => {
    //});

    lineReader.resume();
  });
};

module.exports = readNote;
