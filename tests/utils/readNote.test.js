const readNote = require('../../lib/utils/readNote');
const Note = require('../../lib/model/Note');

describe('The note reader', () => {
  it('should read a simple note', async () => {
    await expect(readNote('./tests/fixtures/2017-09-25-08-46-00.md')).resolves.toHaveProperty('title');
    await expect(readNote('./tests/fixtures/2017-09-25-08-46-00.md')).resolves.toHaveProperty('tags');
    await expect(readNote('./tests/fixtures/2017-09-25-08-46-00.md')).resolves.toHaveProperty('body');
  });
});
