class Note {
  constructor(meta, body) {
    const parseMeta = (meta) => {
      meta.forEach(metaEntry => {
        const tokens = metaEntry.split(' ');
        const type = tokens[1];

        if (type === 'title') {
          console.log('meta entry', metaEntry);
          this.title = tokens.slice(2).join(' ');
          console.log('this', this);
        }
      });
    };

    this.meta = parseMeta(meta);//parseMeta.bind(this, meta)();
    this.body = body;
  }
}

module.exports = Note;
