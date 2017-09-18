const moment = require('moment');
const dateFormats = require('../utils/constants').dateFormats;
const dateFileFormat = require('../utils/constants').dateFileFormat;
const sourceParser = require('../utils/sourceParser');

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
          this.date = parseDate(data);
        } else if (type === 'tags') {
          this.tags = new Set(data.split(' '));
        // Complex source
        } else if (type.match(/source-/)) {
          if (!this.sourceData) {
            this.sourceData = [];
          }
          this.sourceData.push(data);
        // Simple source
        } else if (type === 'source') {
          if (!this.sourceData) {
            this.sourceData = [];
          }
          this.sourceData.push(data);
        }
      });

      // Once we have found all the meta lines, run the source lines through
      // the source parser
      if (this.sourceData) {
        this.sources = sourceParser(this.sourceData);
      }
    };

    const parseDate = (date) => {
      let dateTry;
      for (let i=0; i<dateFormats.length; i++) {
        let format = dateFormats[i];
        dateTry = moment(date, format);
        if (dateTry.format(format) === date) {
          this.dateFormat = format;
          return dateTry;
        }
      }
      throw `Bad date format! ${date}`;
    };

    const parseCreatedAt = (date) => {
      return moment(path.split('.')[0], dateFileFormat);
    }

    this.createdAt = parseCreatedAt(path);
    parseMeta(meta);
    this.body = body;
  }

  hasTag(tag) {
    if (this.tags) {
      return this.tags.has(tag);
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

  getDateStr() {
    return this.getDate().format(this.dateFormat);
  }

  getDate() {
    return this.date;
  }

  getDecade() {
    const year = this.getDate().format('YYYY');
    return Math.floor(year / 10) * 10;
  }

  isDecade(decadeToTest) {
    return this.getDecade() === decadeToTest;
  }

  getCreatedAtStr() {
    return this.createdAt.format(dateFormat);
  }
}

module.exports = Note;
