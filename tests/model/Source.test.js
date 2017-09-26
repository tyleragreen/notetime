const Source = require('../../lib/model/Source');

describe('A source', () => {
  it('fails if created with a bad prop', () => {
    expect(() => {
      new Source({ bad: 'good' })
    }).toThrow(Error);
  });

  it('fails if created with no props', () => {
    expect(() => {
      new Source({})
    }).toThrow(Error);
  });

  it('fails if created with no arguments', () => {
    expect(() => {
      new Source()
    }).toThrow(Error);
  });

  it('can format with an institution', () => {
    const source = new Source({
      id: 'id',
      title: 'title',
      date: '1999',
      institution: 'institution',
      url: 'url',
    });

    expect(source.print()).toBe('"title," *institution*, 1999. [link](url)');
  });

  it('can format with a publication', () => {
    const source = new Source({
      id: 'id',
      title: 'title',
      date: '1999',
      publication: 'publication',
      url: 'url',
    });

    expect(source.print()).toBe('"title," *publication*, 1999. [link](url)');
  });

  it('can format with a publication with an author and pages', () => {
    const source = new Source({
      id: 'id',
      title: 'title',
      date: '1999',
      publication: 'publication',
      author: 'author',
      pages: 'pages',
      url: 'url',
    });

    expect(source.print()).toBe('author, "title," *publication*, pages, 1999. [link](url)');
  });

  it('can format with just an id and url', () => {
    const source = new Source({
      id: 'id',
      url: 'url',
    });
    expect(source.print()).toBe('[id](url)');
  });
});
