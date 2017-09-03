const moment = require('moment');
const dateFormat = require('./constants').dateFormat;

class Note {
  constructor(meta, body) {
    const parseMeta = (meta) => {
      meta.forEach(metaEntry => {
        const tokens = metaEntry.split(' ');
        const type = tokens[1];
        const data = tokens.slice(2).join(' ');

        if (type === 'title') {
          this.title = data;
        } else if (type === 'date') {
          this.date = moment(data, dateFormat);
        } else if (type === 'tags') {
          this.tags = new Set(data.split(' '));
        }
      });
    };

    this.meta = parseMeta(meta);
    this.body = body;
  }

  hasTag(tag) {
    return this.tags.has(tag);
  }

  getTags() {
    return Array.from(this.tags).sort((a,b) => {
      if (a < b) {
        return -1;
      } else {
        return 1;
      }
    });
  }
}

module.exports = Note;
