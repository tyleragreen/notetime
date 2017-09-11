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

const createRelativeLink = (root, dir, tag) => {
  if (root) {
    return createLink(tag, `${dir}/${tag}.md`);
  } else {
    return createLink(tag, `../${dir}/${tag}.md`);
  }
};

const addMeta = (report, note, root) => {
  report.addLine(`- Meta`);
  if (note.date) {
    report.addLine(`  - Date: ${note.getDateStr()}`);
  }
  if (note.sources) {
    const sources = note.sources.map(source => {
      return createLink(source.name, source.url);
    });
    report.addLine(`  - Sources: ${sources.join(' ')}`);
  }
  //report.addLine(`- Created at: ${note.getCreatedAtStr()}`);
  if (note.tags) {
    const tags = note.getTags().map(tag => {
      return createRelativeLink(root, 'tags', tag);
    });
    report.addLine(`  - Tags: ${tags.join(' ')}`);
  }
};

const addNoteToReport = (report, note, root) => {
  report.addLine(`### ${note.title}`);
  note.body.forEach(line => {
    report.addLine(line);
  });

  addMeta(report, note, root);
  report.addLine();
};

const addTimedNoteToReport = (report, note, root) => {
  report.addLine(`### ${note.getDateStr()}`);
  report.addLine(`#### ${note.title}`);
  note.body.forEach(line => {
    report.addLine(line);
  });

  addMeta(report, note, root);
  report.addLine();
};

const writeReport = (dir, filename, report) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFileSync(`${dir}/${filename}.md`, report);
};

const createReport = (title, desc, tags, notes, tagFilter, timelines) => {
  const root = tagFilter ? false : true;
  const report = new Report(title);

  if (desc) {
    report.addLine(desc);
  }

  // I'm experimenting with taking out the inline navigation and relying
  // on Gitbook side navigation (which is sourced from the index pages
  // created by this script)
  //if (timelines) {
  //  report.addLine('## Timelines');
  //  timelines.forEach(timeline => {
  //    report.addLine(`- ${createRelativeLink(root, 'timelines', timeline)}`);
  //  });
  //  report.addLine();
  //}
  //report.addLine('## Tags');
  //tags.forEach(tag => {
  //  report.addLine(`- ${createRelativeLink(root, 'tags', tag)}`);
  //});
  //report.addLine();
  //report.addLine(`## Notes`);

  notes.forEach(note => {
    if (!tagFilter || (tagFilter && note.tags && note.hasTag(tagFilter))) {
      addNoteToReport(report, note, root);
    }
  });

  if (tagFilter) {
    writeReport('./tags', tagFilter, report.getText());
  } else {
    writeReport('.', 'README', report.getText());
  }
};

const createTimeline = (title, desc, tags, notes, tagFilter) => {
  const root = tagFilter ? false : true;
  const report = new Report(title);

  if (desc) {
    report.addLine(desc);
  }

  report.addLine(`## Decades`);
  const datedNotes = notes.filter(note => note.getDate());
  const undatedNotes = notes.filter(note => !note.getDate());
  const sortedNotes = datedNotes.sort((a,b) => {
    return (a.getDate < b.getDate) ? 1 : -1;
  }).filter(note => note.hasTag(tagFilter));

  const decades = new Set(sortedNotes.map(note => note.getDecade()));
  const sortedDecades = Array.from(decades).sort((a,b) => {
    return (a < b) ? -1 : 1;
  });

  sortedDecades.forEach(decade => {
    report.addLine(`- ${createLink(decade+'s','#'+decade+'s')}`);
  });
  report.addLine();

  const notesByDecade = Array.from(decades).reduce((acc, decade) => {
    acc[decade] = sortedNotes.filter(note => note.isDecade(decade));
    return acc;
  }, {});
  for (let decade in notesByDecade) {
    report.addLine(`## ${decade}s`);
    notesByDecade[decade].forEach(note => {
      addTimedNoteToReport(report, note, root);
    });
  }
  
  // Also add undated notes to timeline
  if (undatedNotes.length > 1) {
    report.addLine(`## Undated Notes`);
    undatedNotes.forEach(note => {
      if (!tagFilter || (tagFilter && note.tags && note.hasTag(tagFilter))) {
        addNoteToReport(report, note, root);
      }
    });
  }

  if (tagFilter) {
    writeReport('./timelines', tagFilter, report.getText());
  } else {
    writeReport('.', 'README', report.getText());
  }
};

const createSummary = (tags, timelines) => {
  const report = new Report('Summary');
  report.addLine(`- ${createLink('Home', 'README.md')}`);
  report.addLine(`- ${createLink('Timelines', 'timelines/README.md')}`);
  timelines.forEach(timeline => {
    report.addLine(`  - ${createLink(timeline, 'timelines/' + timeline + '.md')}`);
  });
  report.addLine(`- ${createLink('Tags', 'tags/README.md')}`);
  tags.forEach(tag => {
    report.addLine(`  - ${createLink(tag, 'tags/' + tag + '.md')}`);
  });
  writeReport('.', 'SUMMARY', report.getText());
};

const collectTags = (notes) => {
  const arrays = notes.map(note => note.getTags());
  const tags = [].concat.apply([], arrays).sort();
  const set = new Set(tags);
  return Array.from(set);
};

const main = async () => {
  const config = await readConfigAsync();
  const files = await findNotesAsync();
  const notes = await readNotesAsync(files);
  const tags = collectTags(notes);

  const timelines = config.timelines;
  createReport(config.title, config.description, tags, notes, null, timelines);

  createSummary(tags, timelines);

  tags.forEach(tag => {
    createReport(tag, null, tags, notes, tag, timelines);
  });

  if (timelines) {
    timelines.forEach(tag => {
      if (tags.indexOf(tag) === -1) {
        throw `Tag ${tag} does not exist.`;
      }

      const timelineTitle = `${tag} Timeline`;
      createTimeline(timelineTitle, null, tags, notes, tag);
    });
  }
};

main();
