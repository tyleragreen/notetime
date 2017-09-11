const moment = require('moment');
const dateFormats = require('./constants').dateFormats;
const dateFileFormat = require('./constants').dateFileFormat;

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
        } else if (type === 'source') {
          if (!this.sources) {
            this.sources = [];
          }
          this.sources.push({
            name: data.split(' ')[0],
            url: data.split(' ')[1]
          });
        }
      });
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
