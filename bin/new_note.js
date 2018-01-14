#!/usr/bin/env node

const child_process = require('child_process');
const moment = require('moment');
const getNotesLocation = require('../lib/utils/getNotesLocation');
const config = require('../lib/utils/readConfig');
const dateFormat = require('../lib/utils/constants').dateFormats[0];

const go = async () => {
  const path = getNotesLocation(config);
  const date = moment();
  const filename = date.format(dateFormat);
  child_process.spawnSync('vi', [`${path}/${filename}.md`], { stdio: 'inherit' });
};
go();
