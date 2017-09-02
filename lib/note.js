class Note {
  constructor(meta, body) {
    const parseMeta = (meta) => {
      meta.forEach(metaEntry => {
        const tokens = metaEntry.split(' ');
        const type = tokens[1];

        if (type === 'title') {
          this.title = tokens.slice(2).join(' ');
        }
      });
    };

    this.meta = parseMeta(meta);
    this.body = body;
  }
}

module.exports = Note;
