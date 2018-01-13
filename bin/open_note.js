#!/usr/bin/env node

const child_process = require('child_process');
const getNotesLocation = require('../lib/utils/getNotesLocation');
const config = require('../lib/utils/readConfig');

const search = process.argv.slice(2).join(' ');

const go = async () => {
  const path = getNotesLocation(config);
  child_process.exec(`git grep -i "${search}" ${path}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    const lines = stdout.split('\n');
    if (lines.length !== 2) {
      console.error('No single not found! Found:\n', stdout);
      return;
    }
    const file = stdout.split('\n')[0].split(':')[0];
    child_process.spawnSync('vi', [file], { stdio: 'inherit' });
    console.log('Edited: ', file);
  });
};

go();
