const fs = require('fs');
const glob = require('glob');
const readline = require('readline');
const Note = require('./note');
const supportedExtensions = require('./constants').supportedExtensions;
const dateFormat = require('./constants').dateFormat;

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

const createReport = (title, notes, tag) => {
  let report = `# ${title}\n`;
  notes.forEach(note => {
    if (!tag || (tag && note.tags && note.hasTag(tag))) {
      report += `## ${note.title}\n`;
      note.body.forEach(line => {
        report += line;
        report += "\n";
      });
      if (note.date) {
        report += `- Date: ${note.date.format(dateFormat)}\n`;
      }
      if (note.tags) {
        report += `- Tags: ${note.getTags()}\n`
      }
    }
  });

  fs.writeFileSync('./README.md', report);
};

const main = async () => {
  const config = await readConfigAsync();
  const files = await findNotesAsync();
  const notes = await readNotesAsync(files);

  createReport(config.title, notes, "policy");
};

main();
