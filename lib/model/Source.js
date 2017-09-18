const supportedProps = [ 'id', 'title', 'date', 'publication', 'url' ];

class Source {
  constructor(props) {
    for (let prop in props) {
      if (supportedProps.indexOf(prop) === -1) {
        throw new Error(`Unrecognized source property '${prop}'`);
      }

      this[prop] = props[prop];
    }
  }

  getStr() {
    if (this.title && this.publication && this.date && this.url) {
      return `"${this.title}," *${this.publication}, ${this.date}. [link](${this.url})`;
    } else if (this.id && this.url) {
      return `(${this.id})[${this.url}]`;
    } else {
      throw new Error(`Incomplete source!`);
    }
  }
}

module.exports = Source;
