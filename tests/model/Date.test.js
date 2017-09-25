const Date = require('../../lib/model').Date;

describe('A date', () => {
  it('can be created from a year', () => {
    const date = new Date('1999');

    expect(date.print()).toBe('1999');
  });

  it('can be created from a month and a year', () => {
    const date = new Date('December 1999');

    expect(date.print()).toBe('December 1999');
  });

  it('can be created from a month, date, and year', () => {
    const date = new Date('December 5, 1999');

    expect(date.print()).toBe('December 5, 1999');
  });

  it('will fail for an unsupported format', () => {
    expect(() => {
      new Date('1998 June');
    }).toThrow(Error);
  });

  it('can compare two dates', () => {
    const date1 = new Date('January 1, 2008');
    const date2 = new Date('December 31, 2007');

    expect(date1.lessThan(date2)).toBe(false);
  });
});
