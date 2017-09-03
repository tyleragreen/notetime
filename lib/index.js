const fs = require('fs');
const glob = require('glob');
const readline = require('readline');
const Note = require('./note');
const Report = require('./report');
const supportedExtensions = require('./constants').supportedExtensions;

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

const createLink = (text, url) => {
  return `[${text}](${url})`;
};

const createTagLink = (root, tag) => {
  if (root) {
    return createLink(tag, `tags/${tag}.md`);
  } else {
    return createLink(tag, `${tag}.md`);
  }
};

const addNoteToReport = (report, note, root) => {
  report.addLine(`### ${note.title}`);
  note.body.forEach(line => {
    report.addLine(line);
  });
  if (note.date) {
    report.addLine(`- Date: ${note.getDateStr()}`);
  }
  if (note.sources) {
    const sources = note.sources.map(source => {
      return createLink(source.name, source.url);
    });
    report.addLine(`- Sources: ${sources.join(' ')}`);
  }
  report.addLine(`- Created at: ${note.getCreatedAtStr()}`);
  if (note.tags) {
    const tags = note.getTags().map(tag => {
      return createTagLink(root, tag);
    });
    report.addLine(`- Tags: ${tags.join(' ')}`);
  }
};

const createReport = (title, desc, tags, notes, tagFilter) => {
  const root = tagFilter ? false : true;
  const report = new Report(title);

  if (desc) {
    report.addLine(desc);
  }

  report.addLine('## Tags');
  tags.forEach(tag => {
    report.addLine(`- ${createTagLink(root, tag)}`);
  });
  report.addLine(`## Notes`);
  notes.forEach(note => {
    if (!tagFilter || (tagFilter && note.tags && note.hasTag(tagFilter))) {
      addNoteToReport(report, note, root);
    }
  });

  if (tagFilter) {
    const dir = './tags';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFileSync(`${dir}/${tagFilter}.md`, report.getText());
  } else {
    fs.writeFileSync('./README.md', report.getText());
  }
};

const collectTags = (notes) => {
  const arrays = notes.map(note => note.getTags());
  const tags = [].concat.apply([], arrays).sort((a,b) => {
    if (a < b) {
      return -1;
    } else {
      return 1;
    }
  });
  const set = new Set(tags);
  return Array.from(set);
};

const main = async () => {
  const config = await readConfigAsync();
  const files = await findNotesAsync();
  const notes = await readNotesAsync(files);
  const tags = collectTags(notes);

  createReport(config.title, config.description, tags, notes);

  tags.forEach(tag => {
    createReport(tag, null, tags, notes, tag);
  });

  if (config.timelines) {
    config.timelines.forEach(tag => {
      if (tags.indexOf(tag) === -1) {
        throw `Tag ${tag} does not exist.`;
      }
    });
  }
};

main();
