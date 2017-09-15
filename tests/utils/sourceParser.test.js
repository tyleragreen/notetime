const readNote = require('../../lib/utils/readNote');
const sourceParser = require('../../lib/utils/sourceParser');
const lineParser = require('../../lib/utils/lineParser');

const singleSource = [
  "; source-id nyt",
  "; source-publication New York Times",
  "; source-title DOLE SEES 'HORROR STORY' IN M.T.A. LEASING DEAL",
  "; source-date April 9, 1982",
  "; source-url http://www.nytimes.com/1982/04/09/nyregion/dole-sees-horror-story-in-mta-leasing-deal.html",
];

const multiSource = singleSource.concat([
  "; 2-source-id nyt",
  "; 2-source-publication New York Times",
  "; 2-source-title DOLE SEES 'HORROR STORY' IN M.T.A. LEASING DEAL",
  "; 2-source-date April 9, 1982",
  "; 2-source-url http://www.nytimes.com/1982/04/09/nyregion/dole-sees-horror-story-in-mta-leasing-deal.html",
]);

const tripleSource = [
  "; source-title Title 1",
  "; 4-source-title Title 3",
  "; 2-source-title Title 2",
];

const multipleFirstSources = [
  '; source-title Title 1',
  '; 1-source-title Title 2',
];

const invalidSource = [
  '; source-bad This tag is not recognized',
];

describe('The source parser', () => {
  it('should reject an invalid property', () => {
    //const sources = sourceParser(invalidSource);
    expect(() => {
      sourceParser(invalidSource)
    }).toThrow(Error);
  });

  it('should parse a single source', () => {
    const sources = sourceParser(singleSource);
    const source = sources[0];

    expect(sources.length).toBe(1);
    expect(source.publication).toBe(lineParser(singleSource[1]));
    expect(source.title).toBe(lineParser(singleSource[2]));
    expect(source.date).toBe(lineParser(singleSource[3]));
    expect(source.url).toBe(lineParser(singleSource[4]));
  });

  it('should parse multiple sources', () => {
    const sources = sourceParser(multiSource);
    const firstSource = sources[0];
    const secondSource = sources[1];

    expect(sources.length).toBe(2);
    expect(firstSource.publication).toBe(lineParser(multiSource[1]));
    expect(firstSource.title).toBe(lineParser(multiSource[2]));
    expect(firstSource.date).toBe(lineParser(multiSource[3]));
    expect(firstSource.url).toBe(lineParser(multiSource[4]));

    expect(secondSource.publication).toBe(lineParser(multiSource[6]));
    expect(secondSource.title).toBe(lineParser(multiSource[7]));
    expect(secondSource.date).toBe(lineParser(multiSource[8]));
    expect(secondSource.url).toBe(lineParser(multiSource[9]));
  });

  it('should parse three interleaved sources', () => {
    const sources = sourceParser(tripleSource);

    expect(sources[0].title).toBe(lineParser(tripleSource[0]));
    expect(sources[1].title).toBe(lineParser(tripleSource[2]));
    expect(sources[2].title).toBe(lineParser(tripleSource[1]));
  });

  it('should parse two sources with the different first notation', () => {
    const sources = sourceParser(multipleFirstSources);

    expect(sources.length).toBe(2);
    expect(sources[0].title).toBe(lineParser(multipleFirstSources[0]));
    expect(sources[1].title).toBe(lineParser(multipleFirstSources[1]));
  });
});
