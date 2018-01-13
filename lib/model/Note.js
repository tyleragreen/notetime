const moment = require('moment');
const sourceParser = require('../utils/sourceParser');
const Date = require('./Date');

class Note {
  constructor(path, meta, body) {
    const parseMeta = (meta) => {
      meta.forEach(metaEntry => {
        const tokens = metaEntry.split(' ');
        const type = tokens[1];
        const data = tokens.slice(2).join(' ');

        if (type === 'title') {
          this.title = data;
        } else if (type === 'date') {
          this.date = new Date(data);
        } else if (type === 'tags') {
          this.tags = new Set(data.split(' '));
        // Complex source
        } else if (type.match(/source-/)) {
          if (!this.sourceData) {
            this.sourceData = [];
          }
          this.sourceData.push(metaEntry);
        // Simple source
        } else if (type === 'source') {
          if (!this.sourceData) {
            this.sourceData = [];
          }
          this.sourceData.push(metaEntry);
        }
      });

      // Once we have found all the meta lines, run the source lines through
      // the source parser
      if (this.sourceData) {
        this.sources = sourceParser(this.sourceData);
      }
    };

    const parseCreatedAt = (path) => {
      // remove extension
      let date = path.split('.')[path.split('.').length-2];
      // remove directories
      date = date.split('/')[date.split('/').length-1];
      return new Date(date);
    }

    this.createdAt = parseCreatedAt(path);
    this.body = body;
    parseMeta(meta);
  }

  hasTag(tag) {
    if (this.tags) {
      return this.tags.has(tag);
    } else {
      return false;
    }
  }

  hasSource(src) {
    if (this.sources) {
      return this.sources.filter(source => source.id === src).length > 0;
    } else {
      return false;
    }
  }

  getTags() {
    if (this.tags) {
      return Array.from(this.tags).sort((a,b) => {
        if (a < b) {
          return -1;
        } else {
          return 1;
        }
      });
    } else {
      return false;
    }
  }

  getDate() {
    if (this.date) {
      return this.date;
    } else if (this.sources && this.sources.length === 1 && this.sources[0].getDate()) {
      return this.sources[0].getDate();
    } else {
      return null;
    }
  }

  getDecade() {
    const year = this.getDate().printDecade();
    return Math.floor(year / 10) * 10;
  }

  isDecade(decadeToTest) {
    return this.getDecade() === decadeToTest;
  }
}

module.exports = Note;
