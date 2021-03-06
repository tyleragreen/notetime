const readNote = require('../../lib/utils/readNote');
const sourceParser = require('../../lib/utils/sourceParser');
const lineParser = require('../../lib/utils/lineParser');

const invalidSource = [
  '; source-bad This tag is not recognized',
];

const invalidSingleSource = [
  "; source-id nyt",
  "; source-publication New York Times",
  "; source-title DOLE SEES 'HORROR STORY' IN M.T.A. LEASING DEAL",
  "; source-date April 9, 1982",
  "; source-url http://www.nytimes.com/1982/04/09/nyregion/dole-sees-horror-story-in-mta-leasing-deal.html",
];

const validComplexSource = [
  "; 2-source-id nyt",
  "; 2-source-publication New York Times",
  "; 2-source-title DOLE SEES 'HORROR STORY' IN M.T.A. LEASING DEAL",
  "; 2-source-date April 9, 1982",
  "; 2-source-url http://www.nytimes.com/1982/04/09/nyregion/dole-sees-horror-story-in-mta-leasing-deal.html",
]

const invalidMultiSource = invalidSingleSource.concat(validComplexSource);

const invalidTripleSource = [
  "; source-title Title 12",
  "; 4-source-title Title 3",
  "; 2-source-title Title 2",
];

const validTripleSource = [
  "; 1-source-title Title 1",
  "; 4-source-title Title 3",
  "; 2-source-title Title 2",
  "; 2-source-author Author 2",
];

const multipleFirstSources = [
  '; source-title Title 1',
  '; 1-source-title Title 2',
];

describe('The source parser', () => {

  // ----------------------------------------------------------
  // Basic Validation

  it('should reject an invalid property', () => {
    expect(() => {
      sourceParser(invalidSource)
    }).toThrow(Error);
  });

  // ----------------------------------------------------------
  // Simple Sources

  it('should parse a simple source', () => {
    const singleSimpleSource = [
      '; source nyt url',
    ];
    const sources = sourceParser(singleSimpleSource);

    expect(sources.length).toBe(1);
    expect(sources[0].id).toBe('nyt');
    expect(sources[0].url).toBe('url');
    expect(sources[0].title).toBe(undefined);
    expect(sources[0].publication).toBe(undefined);
    expect(sources[0].date).toBe(undefined);
  });

  it('should parse multiple simple sources', () => {
    const multipleSimpleSource = [
      '; source nyt url',
      '; source nydn url2',
    ];
    const sources = sourceParser(multipleSimpleSource);

    expect(sources.length).toBe(2);
    expect(sources[0].id).toBe('nyt');
    expect(sources[0].url).toBe('url');
    expect(sources[0].title).toBe(undefined);
    expect(sources[0].publication).toBe(undefined);
    expect(sources[0].date).toBe(undefined);

    expect(sources[1].id).toBe('nydn');
    expect(sources[1].url).toBe('url2');
    expect(sources[1].title).toBe(undefined);
    expect(sources[1].publication).toBe(undefined);
    expect(sources[1].date).toBe(undefined);
  });

  // ----------------------------------------------------------
  // Complex Sources

  it('should parse a complex source', () => {
    const sources = sourceParser(validComplexSource);
    const source = sources[0];

    expect(sources.length).toBe(1);
    expect(source.publication).toBe(lineParser(validComplexSource[1]));
    expect(source.title).toBe(lineParser(validComplexSource[2]));
    expect(source.date.print()).toBe(lineParser(validComplexSource[3]));
    expect(source.url).toBe(lineParser(validComplexSource[4]));
  });

  it('should parse multiple complex sources', () => {
    const sources = sourceParser(validTripleSource);

    expect(sources.length).toBe(3);
    expect(sources[0].title).toBe('Title 1');
    expect(sources[1].title).toBe('Title 2');
    expect(sources[1].author).toBe('Author 2');
    expect(sources[2].title).toBe('Title 3');
  });

  it('should fail to parse a complex source without an identifier', () => {
    expect(() => {
      sourceParser(invalidSingleSource)
    }).toThrow(Error);
  });

  it('should fail to parse multiple complex sources if one is missing an identifier', () => {
    expect(() => {
      sourceParser(invalidMultiSource)
    }).toThrow(Error);
  });

  it('should fail to parse three complex sources if one is missing an identifier', () => {
    expect(() => {
      sourceParser(invalidTripleSource)
    }).toThrow(Error);
  });

  it('should parse two sources with the different first notation', () => {
    expect(() => {
      sourceParser(multipleFirstSources)
    }).toThrow(Error);
  });
});
