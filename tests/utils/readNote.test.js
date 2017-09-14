const readNote = require('../../lib/utils/readNote');
const Note = require('../../lib/model/Note');

describe('The note reader', () => {
  it('should read a simple note', async () => {
    await expect(readNote('./tests/fixtures/simple_note.md')).resolves.toHaveProperty('title');
    await expect(readNote('./tests/fixtures/simple_note.md')).resolves.toHaveProperty('tags');
    await expect(readNote('./tests/fixtures/simple_note.md')).resolves.toHaveProperty('body');
  });
});
