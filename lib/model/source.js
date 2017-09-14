class Source {
  constructor(props) {
    for (let prop in props) {
      this[prop] = props[prop];
    }
  }
}

module.exports = Source;
