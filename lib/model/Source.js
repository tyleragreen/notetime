const supportedProps = [
  'id',
  'title',
  'date',
  'publication',
  'url',
  'pages',
  'author',
];

class Source {
  constructor(props) {
    for (let prop in props) {
      if (supportedProps.indexOf(prop) === -1) {
        throw new Error(`Unrecognized source property '${prop}'`);
      }

      // Remove quotation marks from around title, if they exist
      if (prop === 'title') {
        const length = props[prop].length;
        if (props[prop][0] === '"' && props[prop][length-1] === '"') {
          props[prop] = props[prop].slice(1, length-1);
        }
      }

      this[prop] = props[prop];
    }
  }

  getStr() {
    if (this.title && this.publication && this.date && this.url) {
      return `"${this.title}," *${this.publication}*, ${this.date}. [link](${this.url})`;
    } else if (this.id && this.url) {
      return `[${this.id}](${this.url})`;
    } else {
      const seenProps = [];
      for (let prop in this) {
        seenProps.push(`${prop}=${this[prop]}`);
      }
      throw new Error(`Incomplete source! ${seenProps}`);
    }
  }
}

module.exports = Source;
