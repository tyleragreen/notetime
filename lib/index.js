const fs = require('fs');
const glob = require('glob');
const Report = require('./model').Report;
const readNote = require('./utils/readNote');
const config = require('./utils/readConfig');
const supportedExtensions = require('./utils/constants').supportedExtensions;
const getNotesLocation = require('./utils/getNotesLocation');

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
    note.sources.forEach(source => {
      report.addLine(`- Source: ${source.print()}`);
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
  if (note.date) {
    report.addLine(`- Date: ${note.getDate().print()}`);
  }
  note.body.forEach(line => {
    report.addLine(line);
  });

  addTimedMeta(report, note, root);
  report.addLine();
};

const addTimedNoteToReport = (report, note, root) => {
  report.addLine(`**${note.getDate().print()}** - ${note.title}`);
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

const createReport = (label, desc, dir, notes, tagFilter) => {
  const root = tagFilter ? false : true;
  const report = new Report(label);

  if (desc) {
    report.addLine(desc);
  }

  const sortedNotes = notes.slice().sort((a,b) => {
    return (a.createdAt.lessThan(b.createdAt)) ? 1 : -1;
  });

  sortedNotes.forEach(note => {
    if (!tagFilter || (tagFilter && tagFilter(note, label))) {
      addNoteToReport(report, note, root);
    }
  });

  if (tagFilter) {
    writeReport(`./${dir}`, label, report.getText());
  } else {
    writeReport('.', 'README', report.getText());
  }
};

const createTimeline = (title, desc, notes, tagFilter) => {
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
    return (a.getDate().lessThan(b.getDate())) ? -1 : 1;
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
const createSummary = (tags, timelines, sources) => {
  const report = new Report('Summary');
  report.addLine(`- ${createLink('Home', 'README.md')}`);

  // Timelines
  if (timelines) {
    const timelineIndex = new Report('Timelines');
    report.addLine(`- ${createLink('Timelines', 'timelines/README.md')}`);
    timelines.forEach(timeline => {
      report.addLine(`  - ${createLink(timeline, 'timelines/' + timeline + '.md')}`);
      timelineIndex.addLine(`  - ${createLink(timeline, './' + timeline + '.md')}`);
    });
    writeReport('./timelines', 'README', timelineIndex.getText());
  }

  // Tags
  const tagsIndex = new Report('Tags');
  report.addLine(`- ${createLink('Tags', 'tags/README.md')}`);
  tags.forEach(tag => {
    report.addLine(`  - ${createLink(tag, 'tags/' + tag + '.md')}`);
    tagsIndex.addLine(`  - ${createLink(tag, './' + tag + '.md')}`);
  });
  writeReport('./tags', 'README', tagsIndex.getText());

  if (sources) {
    const sourcesIndex = new Report('Sources');
    report.addLine(`- ${createLink('Sources', 'sources/README.md')}`);
    sources.forEach(source => {
      report.addLine(`  - ${createLink(source, 'sources/' + source + '.md')}`);
      sourcesIndex.addLine(`  - ${createLink(source, './' + source + '.md')}`);
    });
    writeReport('./sources', 'README', sourcesIndex.getText());
  }

  writeReport('.', 'SUMMARY', report.getText());
};

const collectTags = (notes) => {
  const arrays = notes.map(note => note.getTags());
  const tags = [].concat.apply([], arrays).sort();
  const set = new Set(tags);
  return Array.from(set);
};

const main = async () => {
  const path = getNotesLocation(config);
  const files = await findNotesAsync(path);
  console.log(`Processing ${files.length} notes from '${path}'.`);
  const notes = await readNotesAsync(files);
  const tags = collectTags(notes);

  const timelines = config.timelines;
  const sources = Object.keys(config.sources);

  createReport(config.title, config.description, null, notes, null);

  createSummary(tags, timelines, sources);

  tags.forEach(tag => {
    createReport(tag, null, 'tags', notes, (note, tag) => {
      return note.hasTag(tag);
    });
  });

  if (sources) {
    sources.forEach(source => {
      createReport(source, null, 'sources', notes, (note, source) => {
        return note.hasSource(source);
      });
    });
  }

  if (timelines) {
    timelines.forEach(tag => {
      if (tags.indexOf(tag) === -1) {
        throw new Error(`Tag ${tag} does not exist.`);
      }

      const timelineTitle = `${tag} Timeline`;
      createTimeline(timelineTitle, null, notes, tag);
    });
  }
};

main();
