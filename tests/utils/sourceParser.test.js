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

describe('The source parser', () => {
  it('should parse a single source', async () => {
    const sources = sourceParser(singleSource);
    const source = sources[0];

    expect(sources.length).toBe(1);
    expect(source.publication).toBe(lineParser(singleSource[1]));
    expect(source.title).toBe(lineParser(singleSource[2]));
    expect(source.date).toBe(lineParser(singleSource[3]));
    expect(source.url).toBe(lineParser(singleSource[4]));
  });

  xit('should parse multiple sources', async () => {
    const sources = sourceParser(singleSource);
    const firstSource = sources[0];
    const secondSource = sources[1];

    expect(sources.length).toBe(2);
    expect(firstSource.publication).toBe(multiSource[1].slice(3));
    expect(firstSource.title).toBe(multiSource[2].slice(3));
    expect(firstSource.getDateStr()).toBe(multiSource[3].slice(3));
    expect(firstSource.url).toBe(multiSource[4].slice(3));

    expect(secondSource.publication).toBe(multiSource[5].slice(3));
    expect(secondSource.title).toBe(multiSource[6].slice(3));
    expect(secondSource.getDateStr()).toBe(multiSource[7].slice(3));
    expect(secondSource.url).toBe(multiSource[8].slice(3));
  });
});
