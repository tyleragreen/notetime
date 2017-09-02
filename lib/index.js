const fs = require('fs');
const glob = require('glob');
const readline = require('readline');
const Note = require('./note');
const supportedExtensions = require('./constants').supportedExtensions;

const readFileAsync = (path) => {
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
      const note = new Note(meta, body);
      resolve(note);
    });

     // Looks like readline doesn't emit an error event?
     // TODO figure out when to send Promise.reject
    //lineReader.on('error', (err) => {
    //});

    lineReader.resume();
  });
};

const findNotesAsync = () => {
  return new Promise((resolve, reject) => {
    glob(`notes/*.*(${supportedExtensions.join('|')})`, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

const readNotesAsync = (files) => {
  return new Promise((resolve, reject) => {
    const notes = [];
    files.forEach(async (filepath) => {
      const note = await readFileAsync(filepath);
      notes.push(note);
      
      if (notes.length === files.length) {
        resolve(notes);
      }
    });
  });
};

const createReport = (notes) => {
  let report = "";
  notes.forEach(note => {
    note.body.forEach(line => {
      report += line;
      report += "\n";
    });
  });

  fs.writeFileSync('./README.md', report);
};

const main = async () => {
  const files = await findNotesAsync();
  const notes = await readNotesAsync(files);

  createReport(notes);
};

main();
