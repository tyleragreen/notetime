const supportedProps = [ 'id', 'title', 'date', 'publication', 'url' ];

class Source {
  constructor(props) {
    for (let prop in props) {
      if (supportedProps.indexOf(prop) === -1) {
        throw `Unrecognized source property '${prop}'`;
      }

      this[prop] = props[prop];
    }
  }
}

module.exports = Source;
