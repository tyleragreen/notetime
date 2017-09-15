const fs = require('fs');
const glob = require('glob');
const Report = require('./model').Report;
const readNote = require('./utils/readNote');
const supportedExtensions = require('./utils/constants').supportedExtensions;
const defaultNotePath = require('./utils/constants').defaultNotePath;

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

const findNotesAsync = (path) => {
  return new Promise((resolve, reject) => {
    glob(`${path}/*.*(${supportedExtensions.join('|')})`, (err, files) => {
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
      const note = await readNote(filepath);
      notes.push(note);
      
      if (notes.length === files.length) {
        resolve(notes);
      }
    });
  });
};

const createSourceLink = (source) => {
  if (source.title) {
    return createLink(`"${source.title}"`, source.url);
  } else {
    return createLink(source.name, source.url);
  }
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

const addTimedMeta = (report, note, root) => {
  if (note.sources) {
    const sources = note.sources.map(source => {
      return createSourceLink(source);
    });
    report.addLine(`- Sources: ${sources.join(' ')}`);
  }
  if (note.citations) {
    note.citations.forEach(citation => {
      report.addLine(`- ${citation.text}`);
    });
  }
  if (note.tags) {
    const tags = note.getTags().map(tag => {
      return createRelativeLink(root, 'tags', tag);
    });
    report.addLine(`- Tags: ${tags.join(' ')}`);
  }
};

const addNoteToReport = (report, note, root) => {
  report.addLine(`### ${note.title}`);
  note.body.forEach(line => {
    report.addLine(line);
  });

  addTimedMeta(report, note, root);
  report.addLine();
};

const addTimedNoteToReport = (report, note, root) => {
  report.addLine(`**${note.getDateStr()}** - ${note.title}`);
  note.body.forEach(line => {
    report.addLine(line);
  });

  addTimedMeta(report, note, root);
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

  const sortedNotes = notes.slice().sort((a,b) => {
    return (a.createdAt < b.createdAt) ? 1 : -1;
  });

  sortedNotes.forEach(note => {
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
  if (!tagFilter) {
    throw 'tag filter required to create timeline';
  }

  const root = tagFilter ? false : true;
  const report = new Report(title);

  if (desc) {
    report.addLine(desc);
  }

  report.addLine(`## Decades`);
  const filteredNotes = notes.filter(note => note.hasTag(tagFilter));
  const datedNotes = filteredNotes.filter(note => note.getDate());
  const undatedNotes = filteredNotes.filter(note => !note.getDate());
  const sortedNotes = datedNotes.slice().sort((a,b) => {
    return (a.getDate() < b.getDate()) ? -1 : 1;
  });

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
      addNoteToReport(report, note, root);
    });
  }

  writeReport('./timelines', tagFilter, report.getText());
};

// The SUMMARY file acts at the table of contents for the repo.
// This file is also parsed by GitBook to produce the navigation.
const createSummary = (tags, timelines) => {
  const report = new Report('Summary');
  report.addLine(`- ${createLink('Home', 'README.md')}`);

  // Timelines
  const timelineIndex = new Report('Timelines');
  report.addLine(`- ${createLink('Timelines', 'timelines/README.md')}`);
  timelines.forEach(timeline => {
    report.addLine(`  - ${createLink(timeline, 'timelines/' + timeline + '.md')}`);
    timelineIndex.addLine(`  - ${createLink(timeline, './' + timeline + '.md')}`);
  });
  writeReport('./timelines', 'README', timelineIndex.getText());

  // Tags
  const tagsIndex = new Report('Tags');
  report.addLine(`- ${createLink('Tags', 'tags/README.md')}`);
  tags.forEach(tag => {
    report.addLine(`  - ${createLink(tag, 'tags/' + tag + '.md')}`);
    tagsIndex.addLine(`  - ${createLink(tag, './' + tag + '.md')}`);
  });
  writeReport('./tags', 'README', tagsIndex.getText());

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
  const files = await findNotesAsync(config.path || defaultNotePath);
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
