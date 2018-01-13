const Date = require('../../lib/model/Date');
const config = require('../utils/readConfig');

const supportedProps = [
  'id',
  'title',
  'date',
  'publication',
  'url',
  'pages',
  'author',
  'institution',
];

class Source {
  constructor(props) {
    let propCount = 0;
    for (let prop in props) {
      if (supportedProps.indexOf(prop) === -1) {
        throw new Error(`Unrecognized source property '${prop}'`);
      }

      switch (prop) {
        case 'title':
          const length = props.title.length;
          if (props.title[0] === '"' && props.title[length-1] === '"') {
            this.title = props.title.slice(1, length-1);
          } else {
            this.title = props.title;
          }
          break;
        case 'date':
          this.date = new Date(props.date);
          break;
        case 'id':
          const id = props['id']
          if (config.sources && config.sources[id]) {
            this.publication = config.sources[id];
          }
        default:
          this[prop] = props[prop];
      }
      propCount += 1;
    }

    if (propCount === 0) {
      throw new Error('Empty source created.');
    }
  }

  getDate() {
    return this.date;
  }

  print() {
    if (this.title && this.publication && this.date && this.url) {
      let publication = this.pages ? `*${this.publication}*, pp${this.pages}` : `*${this.publication}*`;
      let src = `"${this.title}," ${publication}, ${this.date.print()}. [link](${this.url})`;
      if (this.author) {
        src = `${this.author}, ${src}`;
      }
      return src;
    } else if (this.title && this.institution && this.date && this.url) {
      let institution = this.pages ? `*${this.institution}*, ${this.pages}` : `*${this.institution}*`;
      return `"${this.title}," ${institution}, ${this.date.print()}. [link](${this.url})`;
    } else if (this.title && this.author && this.pages && this.date) {
      return `${this.author}, "${this.title}", ${this.date.print()}, pp${this.pages}.`;
    } else if (this.id && this.url) {
      return `[${this.id}](${this.url})`;
    } else {
      const seenProps = [];
      for (let prop in this) {
        seenProps.push(`${prop}=${this[prop]}`);
      }
      throw new Error(`Incomplete source! ${seenProps.join(' ')}`);
    }
  }
}

module.exports = Source;
