const Source = require('../../lib/model/Source');

describe('A source', () => {
  it('fails if created with a bad prop', () => {
    expect(() => {
      new Source({ bad: 'good' })
    }).toThrow(Error);
  });

  it('can format with an institution', () => {
    const source = new Source({
      id: 'id',
      title: 'title',
      date: 'date',
      institution: 'institution',
      url: 'url',
    });

    expect(source.getStr()).toBe('"title," *institution*, date. [link](url)');
  });

  it('can format with a publication', () => {
    const source = new Source({
      id: 'id',
      title: 'title',
      date: 'date',
      publication: 'publication',
      url: 'url',
    });

    expect(source.getStr()).toBe('"title," *publication*, date. [link](url)');
  });

  it('can format with just an id and url', () => {
    const source = new Source({
      id: 'id',
      url: 'url',
    });
    expect(source.getStr()).toBe('[id](url)');
  });
});
