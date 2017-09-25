const moment = require('moment');
const dateFormats = require('../utils/constants').dateFormats;

class Date {
  constructor(date) {
    let dateTry;
    for (let i=0; i<dateFormats.length; i++) {
      let format = dateFormats[i];
      dateTry = moment(date, format);
      if (dateTry.format(format) === date) {
        this.dateFormat = format;
        this.moment = dateTry;
        break;
      }
    }

    if (!this.moment) {
      throw new Error(`Bad date format! ${date}`);
    }
  }

  print() {
    return this.moment.format(this.dateFormat);
  }

  printDecade() {
    return this.moment.format('YYYY');
  }

  lessThan(date) {
    return this.moment < date.moment;
  }
}

module.exports = Date;
